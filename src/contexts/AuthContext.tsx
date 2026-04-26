import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  onboardingComplete: boolean;
  status?: 'pregnant' | 'postpartum';
  pregnancyCount?: '1st' | '2nd' | '3rd';
  pregnancyStartDate?: string;
  deliveryDate?: string;
  currentTrimester?: number;
  emergencyContacts: { name: string; phone: string; relation: string; }[];
  hospitalContact?: string;
  isLaborWatchEnabled?: boolean;
  preferredLanguage?: 'en' | 'kn';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  crisisAlert: { message: string, redFlags: string[] } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  triggerCrisisAlert: (message: string, redFlags: string[]) => void;
  clearCrisisAlert: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [crisisAlert, setCrisisAlert] = useState<{ message: string, redFlags: string[] } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Initialize profile
          const initialProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || '',
            onboardingComplete: false,
            emergencyContacts: [],
            preferredLanguage: 'en',
          };
          await setDoc(docRef, initialProfile);
          setProfile(initialProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Login popup was closed by the user.');
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const triggerCrisisAlert = (message: string, redFlags: string[]) => {
    setCrisisAlert({ message, redFlags });
    // Also trigger browser alert as requested
    window.alert(`CRITICAL HEALTH ALERT: ${message}\n\nDetected Signs: ${redFlags.join(', ')}`);
  };

  const clearCrisisAlert = () => setCrisisAlert(null);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    
    // Sanitize data to remove undefined values which Firestore doesn't accept
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await setDoc(docRef, { ...profile, ...sanitizedData }, { merge: true });
    setProfile(prev => prev ? { ...prev, ...sanitizedData } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      crisisAlert,
      login, 
      logout, 
      updateProfile, 
      triggerCrisisAlert, 
      clearCrisisAlert 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
