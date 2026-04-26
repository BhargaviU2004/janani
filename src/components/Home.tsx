import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Droplet, 
  Wind, 
  ChevronRight, 
  Plus, 
  Upload,
  CalendarDays,
  Heart,
  CheckCircle2,
  Circle,
  Activity,
  Sparkles
} from 'lucide-react';
import { format, differenceInWeeks, addWeeks } from 'date-fns';
import ChatJanani from './ChatJanani';
import { askJanani } from '../lib/chatbot';

export default function Home({ setView }: { setView: (v: any) => void }) {
  const { profile, updateProfile, user } = useAuth();
  const [reminders, setReminders] = useState<{ id: string, text: string, done: boolean }[]>([
    { id: '1', text: 'Iron Tablet (ಐರನ್ ಮಾತ್ರೆ)', done: false },
    { id: '2', text: 'Folic Acid (ಫೋಲಿಕ್ ಆಸಿಡ್)', done: true },
    { id: '3', text: 'Stay Hydrated! (ನೀರು ಕುಡಿಯಿರಿ)', done: false },
  ]);
  const [dailyInsight, setDailyInsight] = useState<{ exciting: string, exercise: string } | null>(null);
  
  const status = profile?.status || 'pregnant';
  const referenceDate = status === 'pregnant' 
    ? (profile?.pregnancyStartDate ? new Date(profile.pregnancyStartDate) : new Date())
    : (profile?.deliveryDate ? new Date(profile.deliveryDate) : new Date());
  
  const weeks = differenceInWeeks(new Date(), referenceDate);
  const trimester = profile?.currentTrimester || 1;
  const dueDate = addWeeks(new Date(profile?.pregnancyStartDate || new Date()), 40);

  useEffect(() => {
    const fetchDaily = async () => {
      const prompt = `Based on profile, tell me one thing I should be excited about week ${weeks} and suggest one gentle exercise. Respond with a JSON object { exciting: string, exercise: string }.`;
      const response = await askJanani(prompt, profile);
      try {
        const json = JSON.parse(response.replace(/```json|```/g, '').trim());
        setDailyInsight(json);
      } catch (e) {
        setDailyInsight({
          exciting: `You're in ${status === 'pregnant' ? 'Week ' + weeks : 'Postpartum Day ' + weeks * 7}! Your baby is growing and so is your strength ✨.`,
          exercise: "A gentle 15-minute walk today 🚶‍♀️."
        });
      }
    };
    fetchDaily();
  }, [weeks, status]);

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const getNutritionTip = (tri: number, stat: string) => {
    if (stat === 'postpartum') {
      return "Postpartum recovery: Focus on staying hydrated and protein-rich foods like sprouted Moong (ಹೆಸರುಕಾಳು) and Galactagogues (milk-boosting) like Methi (ಮೆಂತ್ಯ).";
    }
    switch(tri) {
      case 1: return "Trimester 1: Focus on Folate (ಸೊಪ್ಪು). Light dinner like Idli (ಇಡ್ಲಿ) or Moong dal khichdi helps with morning sickness.";
      case 2: return "Trimester 2: Iron boost with Ragi (ರಾಗಿ ಅಂಬಲಿ). For dinner, include lentils (ಬೇಳೆ ಸಾರು) and leafy vegetables.";
      case 3: return "Trimester 3: Extra Fiber (ನಾರು). Curd rice (ಮೊಸರನ್ನ) or Pongal (ಪೊಂಗಲ್) for a light, easy-to-digest dinner.";
      default: return "South Indian Tip: Use fresh coconut (ತೆಂಗಿನಕಾಯಿ) and curry leaves (ಕರಿಬೇವು) for health.";
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Dark Mode Toggle */}
      <header className="flex justify-between items-center pt-4">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#5A5A40] opacity-60">
            {format(new Date(), 'EEEE, MMMM dd')}
          </p>
          <h1 className="serif text-3xl text-[#5A5A40]">Namaste, {profile?.displayName?.split(' ')[0]} ✨</h1>
        </div>
      </header>

      {/* Hero / Daily Greeting Card */}
      <section className="card-maternal !p-0 overflow-hidden border-none shadow-xl">
        <div className="bg-gradient-to-br from-[#FFB7B2] via-[#FFDAC1] to-[#B2E2F2] p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="serif text-5xl mb-1 text-[#5A5A40]">
                {status === 'pregnant' ? `Week ${weeks}` : `Day ${Math.floor((new Date().getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))}`}
              </h2>
              <p className="text-[#5A5A40]/70 text-sm font-medium">
                {status === 'pregnant' ? `Trimester ${trimester} Journey` : 'Postpartum Recovery'}
              </p>
            </div>
            <div className="bg-white/40 p-3 rounded-2xl backdrop-blur-md">
              {status === 'pregnant' ? <Droplet className="w-6 h-6 text-white" /> : <Heart className="w-6 h-6 text-white" />}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="h-3 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: status === 'pregnant' ? `${(weeks / 40) * 100}%` : `${Math.min((weeks / 12) * 100, 100)}%` }}
                className="h-full bg-white shadow-sm"
              />
            </div>
            <div className="flex justify-between items-center text-[#5A5A40] font-bold text-[10px] uppercase tracking-wider">
              <span>{status === 'pregnant' ? 'Starting Out' : 'Delivery'}</span>
              <span>{status === 'pregnant' ? 'Full Term' : '12 Week Goal'}</span>
            </div>
          </div>
        </div>
        {dailyInsight && (
          <div className="bg-white dark:bg-gray-800 p-6 space-y-4">
            <div className="flex gap-4">
              <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded-xl h-fit">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h5 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Exciting News 🌟</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{dailyInsight.exciting}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded-xl h-fit">
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h5 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Today's Movement ✨</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{dailyInsight.exercise}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('journal')}
          className="card-maternal !bg-[#FFDAC1]/30 dark:!bg-[#FFDAC1]/10 flex flex-col items-center justify-center p-8 hover:scale-[1.02] transition-transform border-dashed border-2 border-[#FFDAC1]"
        >
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl mb-3 shadow-md">
            <Plus className="w-6 h-6 text-[#FFB7B2]" />
          </div>
          <span className="text-xs font-bold text-[#5A5A40] dark:text-gray-200 tracking-wider">
            {status === 'postpartum' ? 'MOOD & RECOVERY' : 'DAILY JOURNAL'}
          </span>
        </button>
        <button 
          onClick={() => setView('reports')}
          className="card-maternal !bg-[#B2E2F2]/30 dark:!bg-[#B2E2F2]/10 flex flex-col items-center justify-center p-8 hover:scale-[1.02] transition-transform border-dashed border-2 border-[#B2E2F2]"
        >
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl mb-3 shadow-md">
            <Upload className="w-6 h-6 text-[#B2E2F2]" />
          </div>
          <span className="text-xs font-bold text-[#5A5A40] dark:text-gray-200 tracking-wider uppercase">Update Reports</span>
        </button>
      </section>

      {/* Tablet Reminder Checklist */}
      <section className="card-maternal bg-[#B2E2F2]/10 dark:bg-gray-800/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="serif text-2xl text-[#5A5A40] dark:text-[#B2E2F2]">Tablet Reminders</h3>
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-lg">CHECKLIST 💊</span>
        </div>
        <div className="space-y-4">
          {reminders.map(reminder => (
            <div 
              key={reminder.id}
              onClick={() => toggleReminder(reminder.id)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              {reminder.done ? (
                <CheckCircle2 className="w-6 h-6 text-teal-500 fill-teal-50" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 group-hover:text-[#B2E2F2]" />
              )}
              <span className={`text-sm font-medium transition-all ${reminder.done ? 'text-gray-400 line-through' : 'text-[#5A5A40] dark:text-gray-200'}`}>
                {reminder.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="serif text-2xl text-[#5A5A40] dark:text-gray-200">
            {status === 'pregnant' ? 'Your Timeline' : 'Recovery Path'}
          </h3>
          <button className="text-xs text-[#5A5A40] dark:text-gray-400 font-bold tracking-widest uppercase flex items-center gap-1">
            History <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {(status === 'pregnant' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6]).map((m) => (
            <div 
              key={m} 
              className={`flex-shrink-0 w-36 h-44 rounded-[32px] p-5 flex flex-col justify-between border-2 transition-all ${m === Math.ceil(weeks/4) ? 'bg-white dark:bg-gray-800 border-[#FFB7B2] shadow-lg scale-105' : 'bg-white/50 dark:bg-gray-800/30 border-transparent opacity-60'}`}
            >
              <span className={`text-[10px] font-bold tracking-tighter ${m === Math.ceil(weeks/4) ? 'text-[#FFB7B2]' : 'text-gray-400'}`}>
                {status === 'pregnant' ? `MONTH ${m}` : `WEEK ${m}`}
              </span>
              <div className="mb-2">
                <div className={`w-10 h-10 rounded-2xl mb-3 flex items-center justify-center ${m <= Math.ceil(weeks/4) ? 'bg-[#FFB7B2]/10 text-[#FFB7B2]' : 'bg-gray-100 dark:bg-gray-700 text-gray-300'}`}>
                  {m <= Math.ceil(weeks/4) ? <Heart className="w-5 h-5 fill-current" /> : <Calendar className="w-5 h-5" />}
                </div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-tight">
                  {status === 'pregnant' 
                    ? (m === 9 ? "Delivery Watch 🤰" : `Growth Stage ${m}`)
                    : `Goal Week ${m}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nutrition Planner Highlight */}
      <section 
        className="card-maternal border-none bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 border-l-4 border-l-orange-400 cursor-pointer"
        onClick={() => setView('nutrition')}
      >
        <div className="flex gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl h-fit shadow-sm">
            <Wind className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Nutrition Insight 🍎</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
              {getNutritionTip(trimester, status)}
            </p>
          </div>
        </div>
      </section>

      <ChatJanani />
    </div>
  );
}
