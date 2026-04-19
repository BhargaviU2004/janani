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
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './Home';
import Journal from './Journal';
import Reports from './Reports';
import Nutrition from './Nutrition';
import Settings from './Settings';
import Onboarding from './Onboarding';

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
    <div className="min-h-screen bg-[#f5f5f0] pb-24">
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
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <div className="pill-nav flex justify-around items-center">
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
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${active ? 'text-[#5A5A40]' : 'text-gray-400'}`}
    >
      <div className={`p-1.5 rounded-lg ${active ? 'bg-[#5A5A40]/10' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
}

function EmergencyTrigger() {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <div className="fixed bottom-24 right-6 pointer-events-none">
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-0 w-64 bg-white p-6 rounded-[24px] shadow-2xl pointer-events-auto border-2 border-red-100"
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">Emergency Alert</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Triggering SOS will instantly notify your emergency contacts and hospital.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("SOS Triggered! Notifying emergency contacts...");
                  setShowConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold shadow-md"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setShowConfirm(!showConfirm)}
        className="btn-emergency w-14 h-14 !p-0 flex items-center justify-center rounded-full pointer-events-auto"
      >
        <ShieldAlert className="w-7 h-7" />
      </button>
    </div>
  );
}
