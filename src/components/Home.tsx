import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Droplet, 
  Wind, 
  ChevronRight, 
  Plus, 
  Upload,
  CalendarDays,
  Heart
} from 'lucide-react';
import { format, differenceInWeeks, addWeeks } from 'date-fns';

export default function Home({ setView }: { setView: (v: any) => void }) {
  const { profile } = useAuth();
  
  const pregnancyStart = profile?.pregnancyStartDate ? new Date(profile.pregnancyStartDate) : new Date();
  const weeks = differenceInWeeks(new Date(), pregnancyStart);
  const trimester = profile?.currentTrimester || 1;
  const dueDate = addWeeks(pregnancyStart, 40);

  const getNutritionTip = (tri: number) => {
    switch(tri) {
      case 1: return "Trimester 1: Focus on Folate (ಸೊಪ್ಪು). Light dinner like Idli (ಇಡ್ಲಿ) or Moong dal khichdi helps with morning sickness.";
      case 2: return "Trimester 2: Iron boost with Ragi (ರಾಗಿ ಅಂಬಲಿ). For dinner, include lentils (ಬೇಳೆ ಸಾರು) and leafy vegetables.";
      case 3: return "Trimester 3: Extra Fiber (ನಾರು). Curd rice (ಮೊಸರನ್ನ) or Pongal (ಪೊಂಗಲ್) for a light, easy-to-digest dinner.";
      default: return "South Indian Tip: Use fresh coconut (ತೆಂಗಿನಕಾಯಿ) and curry leaves (ಕರಿಬೇವು) for health.";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero / Status */}
      <section className="card-maternal bg-gradient-to-br from-[#5A5A40] to-[#4A4A30] text-white p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="serif text-4xl mb-1">Week {weeks}</h2>
            <p className="text-white/70 text-sm">Trimester {trimester} Journey</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <Droplet className="w-5 h-5 text-blue-200" />
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(weeks / 40) * 100}%` }}
                className="h-full bg-white"
              />
            </div>
            <p className="text-[10px] mt-2 text-white/60 tracking-wider uppercase font-bold">Progress to Due Date</p>
          </div>
          <p className="text-xl font-bold">{Math.round((weeks / 40) * 100)}%</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('journal')}
          className="card-maternal flex flex-col items-center justify-center p-6 hover:border-[#5A5A40]/40 transition-colors"
        >
          <div className="bg-blue-50 p-3 rounded-2xl mb-3">
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Daily Journal</span>
        </button>
        <button 
          onClick={() => setView('reports')}
          className="card-maternal flex flex-col items-center justify-center p-6 hover:border-[#5A5A40]/40 transition-colors"
        >
          <div className="bg-purple-50 p-3 rounded-2xl mb-3">
            <Upload className="w-6 h-6 text-purple-500" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Update Reports</span>
        </button>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="serif text-2xl text-[#5A5A40]">Your Timeline</h3>
          <button className="text-sm text-[#5A5A40] font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
            <div 
              key={m} 
              className={`flex-shrink-0 w-32 h-40 rounded-[24px] p-4 flex flex-col justify-between border ${m === Math.ceil(weeks/4) ? 'bg-white border-[#5A5A40] shadow-md' : 'bg-white/50 border-gray-100'}`}
            >
              <span className={`text-xs font-bold ${m === Math.ceil(weeks/4) ? 'text-[#5A5A40]' : 'text-gray-400'}`}>MONTH {m}</span>
              <div className="mb-2">
                <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${m <= Math.ceil(weeks/4) ? 'bg-[#5A5A40]/10 text-[#5A5A40]' : 'bg-gray-50 text-gray-300'}`}>
                  {m <= Math.ceil(weeks/4) ? <Heart className="w-4 h-4 fill-current" /> : <Calendar className="w-4 h-4" />}
                </div>
                <p className="text-[10px] font-medium text-gray-500 line-clamp-2">
                  {m === 9 ? "Labor Watch Active" : `Milestones for Month ${m}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nutrition Planner Highlight */}
      <section 
        className="card-maternal border-l-4 border-l-[#5A5A40] bg-white cursor-pointer"
        onClick={() => setView('nutrition')}
      >
        <div className="flex gap-4">
          <div className="bg-orange-50 p-3 rounded-2xl h-fit">
            <Wind className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">Nutrition Insight</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {getNutritionTip(trimester)}
            </p>
          </div>
        </div>
      </section>

      {/* Due Date Info */}
      <section className="bg-white/50 p-6 rounded-[24px] border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CalendarDays className="w-6 h-6 text-gray-400" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Est. Delivery</p>
            <p className="font-bold text-gray-800">{format(dueDate, 'MMMM dd, yyyy')}</p>
          </div>
        </div>
        <div className="bg-[#5A5A40]/10 px-3 py-1 rounded-full">
          <span className="text-[10px] font-bold text-[#5A5A40]">{differenceInWeeks(dueDate, new Date())} weeks to go</span>
        </div>
      </section>
    </div>
  );
}
