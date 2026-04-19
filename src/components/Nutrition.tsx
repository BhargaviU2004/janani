import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  RefreshCw,
  Leaf
} from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';

export default function Nutrition() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const preferredLanguage = profile?.preferredLanguage || 'en';
  const trimester = profile?.currentTrimester || 1;

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: MODELS.NUTRITION_PLANNER,
        contents: `Create a comprehensive South Indian nutrition plan for a pregnant woman in Trimester ${trimester}. 
        Focus strictly on local ingredients: Ragi, Murungai (Mugginge - Drumstick leaves), Methi (Menthya), lentils (Bele), and seasonal South Indian fruits. 
        
        CRITICAL: All response fields (focus, meals, recipeTip) MUST be in the ${preferredLanguage === 'kn' ? 'KANNADA language (ಕನ್ನಡ)' : 'ENGLISH language'}.
        
        You MUST provide specific recommendations for all four meal times: Breakfast, Lunch, Snack, and Dinner.
        Include:
        1. Daily highlight (e.g. ${preferredLanguage === 'kn' ? 'Iron - ಕಬ್ಬಿನಾಂಶ, Calcium - ಕ್ಯಾಲ್ಸಿಯಂ' : 'Iron, Calcium'})
        2. Detailed meal suggestions for each of the four categories in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}.
        3. A simple South Indian "Recipe Tip" in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}.
        Return a JSON object with all fields populated in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              focus: { type: Type.STRING },
              meals: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  snack: { type: Type.STRING },
                  dinner: { type: Type.STRING }
                },
                required: ["breakfast", "lunch", "snack", "dinner"]
              },
              recipeTip: { type: Type.STRING },
              nutritionalValue: { type: Type.STRING }
            },
            required: ["focus", "meals", "recipeTip"]
          }
        }
      });

      setPlan(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error("Failed to fetch nutrition plan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [trimester, preferredLanguage]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="serif text-3xl text-[#5A5A40]">Nutrition Planner</h3>
          <p className="text-gray-500 text-sm mt-1">Trimester {trimester} • South Indian Focus</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-100 flex gap-1">
            <button 
              onClick={() => updateProfile({ preferredLanguage: 'en' })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${preferredLanguage === 'en' ? 'bg-[#5A5A40] text-white' : 'text-gray-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => updateProfile({ preferredLanguage: 'kn' })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${preferredLanguage === 'kn' ? 'bg-[#5A5A40] text-white' : 'text-gray-400'}`}
            >
              KN
            </button>
          </div>
          <button 
            onClick={fetchPlan}
            className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#5A5A40]"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <UtensilsCrossed className="w-12 h-12 text-[#5A5A40] opacity-20" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-t-[#5A5A40] border-transparent rounded-full"
            />
          </div>
          <p className="text-[#5A5A40] font-medium animate-pulse">Curating your meal plan...</p>
        </div>
      ) : plan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Focus Banner */}
          <div className="card-maternal bg-[#5A5A40] text-white p-6 relative overflow-hidden">
            <Leaf className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
            <div className="flex items-center gap-2 text-white/70 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Today's Focus</span>
            </div>
            <h4 className="serif text-2xl leading-tight">{plan.focus}</h4>
          </div>

          {/* Meals */}
          <div className="space-y-4">
            <MealCard time="Breakfast" meal={plan.meals.breakfast} icon={<Clock className="text-blue-500" />} />
            <MealCard time="Lunch" meal={plan.meals.lunch} icon={<Clock className="text-orange-500" />} />
            <MealCard time="Snack" meal={plan.meals.snack} icon={<Clock className="text-purple-500" />} />
            <MealCard time="Dinner" meal={plan.meals.dinner} icon={<Clock className="text-indigo-500" />} />
          </div>

          {/* Recipe Tip */}
          <div className="card-maternal !bg-[#5A5A40]/5 border-[#5A5A40]/20">
            <h5 className="font-bold text-[#5A5A40] mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Janani's Recipe Tip
            </h5>
            <p className="text-sm text-[#5A5A40] leading-relaxed">
              {plan.recipeTip}
            </p>
          </div>
          
          <div className="bg-white/50 p-6 rounded-[24px] border border-gray-100 italic text-xs text-gray-500 text-center">
            "Eat traditional, eat seasonal. Your health is your baby's foundation."
          </div>
        </div>
      )}
    </div>
  );
}

function MealCard({ time, meal, icon }: { time: string, meal: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="card-maternal !p-5 flex gap-4 items-center"
    >
      <div className="bg-gray-50 p-3 rounded-2xl">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <div>
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{time}</h5>
        <p className="text-sm font-semibold text-gray-700 leading-snug mt-0.5">{meal}</p>
      </div>
    </motion.div>
  );
}
