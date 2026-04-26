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
  Leaf,
  Youtube
} from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Nutrition() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const preferredLanguage = profile?.preferredLanguage || 'en';
  const status = profile?.status || 'pregnant';
  const trimester = profile?.currentTrimester || 1;

  const fetchPlan = async () => {
    setLoading(true);
    try {
      // Fetch latest mood from journal
      let latestMood = "Normal";
      try {
        const journalSnap = await getDocs(query(
          collection(db, 'users', profile?.uid || '', 'journal'),
          orderBy('timestamp', 'desc'),
          limit(1)
        ));
        if (!journalSnap.empty) {
          latestMood = journalSnap.docs[0].data().analysis?.mood || "Normal";
        }
      } catch (e) {
        console.error("Mood fetch failed", e);
      }
      
      const response = await ai.models.generateContent({
        model: MODELS.NUTRITION_PLANNER,
        contents: `Create a diverse and varied South Indian nutrition plan. 
        User Status: ${status === 'pregnant' ? `in Trimester ${trimester} of Pregnancy` : 'in Postpartum Recovery'}.
        Latest Mood from Journal: ${latestMood}.
        
        ${status === 'postpartum' ? 'Focus on Galactagogues (Athe - milk boosting), healing, and energy for the new mother.' : ''}
        
        ADJUST DIET BASED ON EMOTIONS:
        - If the mood is ANXIOUS/STRESSED: Suggest magnesium-rich foods (Banana, Spinach, Almonds) and calming herbal teas.
        - If the mood is TIRED/EXHAUSTED: Suggest energy-boosting foods (Dates, Sprouted pulses, Fruit bowls).
        - If the mood is SAD/LOW: Suggest comforting but healthy warm traditional dishes.
        
        South Indian Staples to include:
        - Grains: Ragi, brown rice, red rice, oats, broken wheat.
        - Greens: Murungai (Drumstick leaves), Methi (Menthya), Palak, Amaranth.
        - Proteins: Lentils (Bele), sprouts, paneer, eggs (if applicable), nuts.
        - Seasonal South Indian fruits and vegetables.
        
        CRITICAL: All response fields (focus, meals, recipeTip) MUST be in the ${preferredLanguage === 'kn' ? 'KANNADA language (ಕನ್ನಡ)' : 'ENGLISH language'}.
        
        You MUST provide specific recommendations for all four meal times: Breakfast, Lunch, Snack, and Dinner.
        Include:
        1. Daily highlight (e.g. ${preferredLanguage === 'kn' ? 'Vitamins & Minerals - ವಿಟಮಿನ್ ಮತ್ತು ಖನಿಜಗಳು' : 'Vitamins & Minerals'})
        2. Detailed meal suggestions for each of the categories in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}.
        3. A simple South Indian "Recipe Tip" in ${preferredLanguage === 'kn' ? 'Kannada' : 'English'}.
        4. A "videoQueries" object containing specific search terms for a YouTube recipe video for Breakfast, Lunch, and Dinner.
        Return a JSON object.`,
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
              nutritionalValue: { type: Type.STRING },
              videoQueries: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING }
                },
                required: ["breakfast", "lunch", "dinner"]
              }
            },
            required: ["focus", "meals", "recipeTip", "videoQueries"]
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
  }, [trimester, preferredLanguage, status]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="serif text-3xl text-[#5A5A40]">Nutrition Planner</h3>
          <p className="text-gray-500 text-sm mt-1">
            {status === 'pregnant' ? `Trimester ${trimester} • South Indian Focus` : 'Postpartum Recovery • South Indian Focus'}
          </p>
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
            <MealCard 
              time="Breakfast" 
              meal={plan.meals.breakfast} 
              icon={<Clock className="text-blue-500" />} 
              videoQuery={plan.videoQueries.breakfast}
            />
            <MealCard 
              time="Lunch" 
              meal={plan.meals.lunch} 
              icon={<Clock className="text-orange-500" />} 
              videoQuery={plan.videoQueries.lunch}
            />
            <MealCard 
              time="Snack" 
              meal={plan.meals.snack} 
              icon={<Clock className="text-purple-500" />} 
            />
            <MealCard 
              time="Dinner" 
              meal={plan.meals.dinner} 
              icon={<Clock className="text-indigo-500" />} 
              videoQuery={plan.videoQueries.dinner}
            />
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

function MealCard({ time, meal, icon, videoQuery }: { time: string, meal: string, icon: React.ReactNode, videoQuery?: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="card-maternal !p-5 flex gap-4 items-center justify-between"
    >
      <div className="flex gap-4 items-center flex-1">
        <div className="bg-gray-50 p-3 rounded-2xl">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
        </div>
        <div>
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{time}</h5>
          <p className="text-sm font-semibold text-gray-700 leading-snug mt-0.5">{meal}</p>
        </div>
      </div>
      
      {videoQuery && (
        <a 
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center group"
          title="Watch Recipe Video"
        >
          <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </a>
      )}
    </motion.div>
  );
}
