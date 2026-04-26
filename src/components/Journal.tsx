import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, AlertCircle, CheckCircle2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';
import { format } from 'date-fns';

export default function Journal() {
  const { user, profile, updateProfile, triggerCrisisAlert } = useAuth();
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const preferredLanguage = profile?.preferredLanguage || 'en';
  const voiceLang = preferredLanguage === 'kn' ? 'kn-IN' : 'en-IN';

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'journal'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const toggleRecording = () => {
    setRecordingError(null);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setRecordingError("Speech recognition not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    if (!isRecording) {
      setIsRecording(true);
      try {
        recognition.start();
      } catch (e) {
        console.error("Start error", e);
        setIsRecording(false);
        setRecordingError("Could not start microphone. Please check permissions.");
        return;
      }
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setContent(prev => prev + ' ' + event.results[i][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'network') {
          setRecordingError("Network error: Please check your internet connection.");
        } else if (event.error === 'not-allowed') {
          setRecordingError("Permission denied: Please enable microphone access.");
        } else {
          setRecordingError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      (window as any)._recognition = recognition;
    } else {
      setIsRecording(false);
      if ((window as any)._recognition) {
        (window as any)._recognition.stop();
      }
    }
  };

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setAnalyzing(true);

    try {
      // AI Analysis
      const status = profile?.status || 'pregnant';
      const response = await ai.models.generateContent({
        model: MODELS.HEALTH_ANALYSIS,
        contents: content,
        config: {
          systemInstruction: `You are Janani AI, a perinatal health specialist. 
          User is currently ${status === 'pregnant' ? 'PREGNANT' : 'POSTPARTUM'}.
          Analyze this journal entry for emotional and physical distress. 
          The entry may be in English, Kannada, or a mix.
          Focus on red flags for ${status === 'pregnant' ? 'PPD (Postpartum Depression) early signs, Preeclampsia, or physical discomfort' : 'PPD (Postpartum Depression), isolation, or physical recovery issues'}.
          Return a JSON object only. Summary should be in the user's preferred language (${preferredLanguage === 'kn' ? 'Kannada' : 'English'}).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              riskLevel: { type: Type.STRING, description: "low, medium, high, or critical" },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING }
            },
            required: ["mood", "riskLevel", "redFlags", "summary"]
          }
        }
      });

      const analysis = JSON.parse(response.text || '{}');

      await addDoc(collection(db, 'users', user.uid, 'journal'), {
        userId: user.uid,
        content,
        timestamp: Timestamp.now(),
        analysis,
        isVoice: false // Could distinguish later
      });

      if (analysis.riskLevel === 'critical') {
        triggerCrisisAlert(analysis.summary, analysis.redFlags || []);
      } else if (analysis.riskLevel === 'high') {
        alert(`🚨 Warning: High-risk health indicators detected.\n\n${analysis.summary}\n\nPlease consult your healthcare provider or visit the nearest hospital.`);
      }

      setContent('');
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="serif text-3xl text-[#5A5A40]">Health Journal</h3>
      
      {/* Input Section */}
      <div className="card-maternal space-y-4">
        <textarea 
          placeholder="How are you feeling today? (Physical or emotional...)"
          className="w-full h-32 p-4 bg-gray-50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100 italic text-[10px] text-gray-400">
          <span className={recordingError ? "text-red-500 font-bold not-italic" : ""}>
            {recordingError || (isRecording ? `Speaking in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}...` : "Tap microphone to dictate your thoughts")}
          </span>
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full p-0.5 shadow-sm border border-gray-100 flex gap-0.5">
              <button 
                onClick={() => updateProfile({ preferredLanguage: 'en' })}
                disabled={isRecording}
                className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all ${preferredLanguage === 'en' ? 'bg-[#5A5A40] text-white' : 'text-gray-400 opacity-50'}`}
              >
                EN
              </button>
              <button 
                onClick={() => updateProfile({ preferredLanguage: 'kn' })}
                disabled={isRecording}
                className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all ${preferredLanguage === 'kn' ? 'bg-[#5A5A40] text-white' : 'text-gray-400 opacity-50'}`}
              >
                KN
              </button>
            </div>
            {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-2" />}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleRecording}
              className={`p-5 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white scale-110' : 'bg-white text-[#5A5A40] border border-gray-100 hover:border-[#5A5A40]/30'}`}
            >
              <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
            {isRecording && (
                <span className="text-xs font-bold text-red-500 animate-pulse ml-2 uppercase tracking-widest">Listening</span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={!content.trim() || analyzing}
            className="btn-primary flex items-center gap-2 disabled:bg-gray-300 h-14 px-8"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {analyzing ? "Analyzing..." : "Save Entry"}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest px-2">
          <MessageSquare className="w-4 h-4" />
          <span>Recent Insights</span>
        </div>
        
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-maternal !p-5 relative overflow-hidden"
            >
              {/* Risk Indicator Tag */}
              <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-bold uppercase rounded-bl-2xl ${
                entry.analysis?.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                entry.analysis?.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {entry.analysis?.riskLevel} risk
              </div>

              <div className="mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {format(entry.timestamp.toDate(), 'MMM dd, h:mm a')}
                </span>
                <p className="text-gray-800 mt-1 line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>
              </div>

              {entry.analysis && (
                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm h-fit">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 mb-1">Janani Analysis</h5>
                    <p className="text-xs text-gray-600 mb-2 leading-tight">
                      {entry.analysis.summary}
                    </p>
                    {entry.analysis.redFlags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.analysis.redFlags.map((flag: string, i: number) => (
                          <span key={i} className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-bold uppercase">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
