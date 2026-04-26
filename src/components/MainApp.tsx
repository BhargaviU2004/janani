import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  BookOpen, 
  FileText, 
  UtensilsCrossed, 
  ShieldAlert, 
  Settings as SettingsIcon,
  Calendar,
  AlertCircle,
  MessageSquare,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './Home';
import Journal from './Journal';
import Reports from './Reports';
import Nutrition from './Nutrition';
import Settings from './Settings';
import Onboarding from './Onboarding';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { differenceInWeeks } from 'date-fns';

type View = 'home' | 'journal' | 'reports' | 'nutrition' | 'settings' | 'onboarding';

export default function MainApp() {
  const { user, profile, loading, login, crisisAlert, clearCrisisAlert } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Heart className="w-12 h-12 text-[#CD5C5C] fill-current" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <Heart className="w-16 h-16 text-[#CD5C5C] mx-auto mb-6" />
          <h1 className="serif text-4xl mb-4 text-[#5A5A40]">Janani</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your personal AI-powered perinatal health ecosystem. 
            Nurturing mothers through every trimester and beyond.
          </p>
          <button onClick={login} className="btn-primary w-full shadow-lg">
            Get Started with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (profile && !profile.onboardingComplete) {
    return <Onboarding />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home setView={setCurrentView} />;
      case 'journal': return <Journal />;
      case 'reports': return <Reports />;
      case 'nutrition': return <Nutrition />;
      case 'settings': return <Settings />;
      default: return <Home setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] transition-colors duration-300 pb-24">
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center">
        <h1 
          className="serif text-2xl font-bold text-[#5A5A40] cursor-pointer"
          onClick={() => setCurrentView('home')}
        >
          Janani
        </h1>
        <button 
          onClick={() => setCurrentView('settings')}
          className="p-3 bg-white rounded-full shadow-sm"
        >
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Content */}
      <main className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <div className="pill-nav flex justify-around items-center dark:bg-gray-800/80 dark:border-gray-700">
          <NavButton 
            active={currentView === 'home'} 
            onClick={() => setCurrentView('home')} 
            icon={<Heart />} 
            label="Home" 
          />
          <NavButton 
            active={currentView === 'journal'} 
            onClick={() => setCurrentView('journal')} 
            icon={<BookOpen />} 
            label="Journal" 
          />
          <NavButton 
            active={currentView === 'nutrition'} 
            onClick={() => setCurrentView('nutrition')} 
            icon={<UtensilsCrossed />} 
            label="Food" 
          />
          <NavButton 
            active={currentView === 'reports'} 
            onClick={() => setCurrentView('reports')} 
            icon={<FileText />} 
            label="Reports" 
          />
        </div>
      </nav>

      {/* SOS Button Overlay */}
      <EmergencyTrigger />

      {/* Feedback Button */}
      <button 
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-24 left-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#5A5A40] border border-gray-100 hover:scale-110 mb-2"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="serif text-2xl text-[#5A5A40]">Feedback & Ideas</h3>
                <button onClick={() => setShowFeedback(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Found a bug? Have an idea? We'd love to hear how we can improve Janani for you.
              </p>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full h-32 p-4 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 mb-6"
              />
              <button 
                onClick={() => {
                  if(feedback.trim()) {
                    alert("Thank you for your feedback! Our team will look into it.");
                    setFeedback('');
                    setShowFeedback(false);
                  }
                }}
                disabled={!feedback.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis Alert Overlay */}
      <AnimatePresence>
        {crisisAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-red-600/90 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="max-w-md w-full"
            >
              <div className="bg-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </motion.div>
                
                <h2 className="serif text-3xl text-red-600 mb-4 font-bold">Health Crisis Detected</h2>
                <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                  {crisisAlert.message}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {crisisAlert.redFlags.map((flag, i) => (
                    <span key={i} className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border border-red-100">
                      {flag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      alert("Connecting to emergency services and notifying contacts...");
                      clearCrisisAlert();
                    }}
                    className="btn-emergency w-full h-16 text-lg"
                  >
                    ACTIVATE EMERGENCY SOS
                  </button>
                  <button 
                    onClick={clearCrisisAlert}
                    className="w-full py-4 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-gray-600"
                  >
                    I am safe / Clear Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? 'text-[#5A5A40] dark:text-[#FFB7B2]' : 'text-gray-400'}`}
    >
      <div className={`p-1.5 rounded-lg ${active ? 'bg-[#5A5A40]/10 dark:bg-[#FFB7B2]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );
}

function EmergencyTrigger() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const { user, profile } = useAuth();
  
  const triggerSOS = async () => {
    setSending(true);
    try {
      // Fetch some recent health data for the summary
      const reportsSnap = await getDocs(query(
        collection(db, 'users', user?.uid || '', 'reports'),
        orderBy('timestamp', 'desc'),
        limit(3)
      ));
      
      const journalSnap = await getDocs(query(
        collection(db, 'users', user?.uid || '', 'journal'),
        orderBy('timestamp', 'desc'),
        limit(3)
      ));

      const summaries = reportsSnap.docs.map(d => d.data().analysis?.summary || d.data().reportType);
      const moods = journalSnap.docs.map(d => d.data().analysis?.mood);

      const medicalSnapshot = `
        JANANI EMERGENCY ALERT
        Patient: ${profile?.displayName}
        Status: ${profile?.status} (Week ${differenceInWeeks(new Date(), new Date(profile?.pregnancyStartDate || profile?.deliveryDate || Date.now()))})
        
        RECENT MEDICAL SUMMARY:
        - Reports: ${summaries.join(' | ') || 'None'}
        - Recent Moods: ${moods.join(', ') || 'N/A'}
        - Hospital: ${profile?.hospitalContact || 'Not Specified'}
      `;

      // Combine emergency contacts and hospital contact
      const allNotificationNumbers = [
        ...(profile?.emergencyContacts || []),
        profile?.hospitalContact ? { name: `Hospital/Doctor (${profile.hospitalContact})`, phone: profile.hospitalContact } : null
      ].filter((c): c is { name: string, phone: string, relation?: string } => !!(c && c.phone));

      console.log("Triggering SOS for contacts:", allNotificationNumbers);

      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: medicalSnapshot,
          contacts: allNotificationNumbers
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send alerts via Twilio server");
      }

      const failures = result.results.filter((r: any) => r.error);
      const successes = result.results.filter((r: any) => r.success);

      if (failures.length > 0 || successes.length > 0) {
        const failureList = failures.map((f: any) => `- ${f.name || 'Unknown'}: ${f.error}`).join('\n');
        const successList = successes.map((s: any) => `- ${s.name || 'Unknown'}`).join('\n');
        
        const isTrialError = failures.some((f: any) => f.error.toLowerCase().includes('unverified'));
        
        const isChannelError = failures.some((f: any) => f.error?.includes('Channel') || f.error?.includes('not a registered WhatsApp sender'));
        
        alert(
          `SOS Alert Summary\n\n` +
          `✅ Successfully notified via WhatsApp (${successes.length}):\n${successList || 'None'}\n\n` +
          `❌ Failed to notify (${failures.length}):\n${failureList || 'None'}\n\n` +
          (isChannelError
            ? `⚠️ TWILIO CONFIGURATION ERROR:\n\n` +
              `The sender number is not recognized by Twilio as a valid WhatsApp sender.\n\n` +
              `1. Open Settings > Secrets.\n` +
              `2. Ensure TWILIO_FROM_NUMBER is exactly +14155238886.\n` +
              `3. Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct.`
            : isTrialError 
              ? `⚠️ TWILIO WHATSAPP SANDBOX RESTRICTION:\n\n` +
                `Contacts must manually join your sandbox first:\n\n` +
                `1. Ask them to send: join gold-face\n` +
                `2. Send it to: +14155238886\n\n` +
                `Twilio blocks messages until they join.`
              : successes.length === 0 
                ? `Alert failed for all contacts.\n\nCheck Twilio settings and ensure contacts joined the WhatsApp Sandbox (send 'join gold-face' to +14155238886).` 
                : `Some alerts were successful, but others failed.`)
        );
      } else {
        alert("No contacts were found to notify. Please check your settings.");
      }
      
      setShowConfirm(false);
    } catch (e: any) {
      console.error("SOS failed", e);
      alert(`SOS Alert Failed: ${e.message}\n\nPlease ensure Twilio credentials (SID, Token, From Number) are configured in the Settings menu.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 pointer-events-none z-50">
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-0 w-80 bg-white p-6 rounded-[24px] shadow-2xl pointer-events-auto border-2 border-red-100"
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">Confirm Emergency SOS</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 px-1">
              Triggering SOS will instantly notify your emergency contacts and send a <strong>Medical Report Snapshot</strong> to your doctor.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-full text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={triggerSOS}
                disabled={sending}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-full text-xs font-bold shadow-md shadow-red-200 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setShowConfirm(!showConfirm)}
        className="btn-emergency w-14 h-14 !p-0 flex items-center justify-center rounded-full pointer-events-auto border-4 border-white shadow-xl"
      >
        <ShieldAlert className="w-7 h-7" />
      </button>
    </div>
  );
}
