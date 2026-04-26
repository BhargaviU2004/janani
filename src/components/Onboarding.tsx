import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Users, Calendar, Phone, Heart, Baby } from 'lucide-react';

export default function Onboarding() {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    status: 'pregnant' as 'pregnant' | 'postpartum',
    pregnancyCount: '1st' as '1st' | '2nd' | '3rd',
    pregnancyStartDate: '',
    deliveryDate: '',
    emergencyContacts: [{ name: '', phone: '', relation: '' }],
    hospitalContact: ''
  });

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      await updateProfile({
        ...data,
        onboardingComplete: true,
        currentTrimester: data.status === 'pregnant' ? calculateTrimester(data.pregnancyStartDate) : undefined
      });
    }
  };

  const calculateTrimester = (date: string) => {
    if (!date) return 1;
    const start = new Date(date);
    const now = new Date();
    const weeks = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weeks <= 12) return 1;
    if (weeks <= 26) return 2;
    return 3;
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...data.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setData({ ...data, emergencyContacts: newContacts });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-6">
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-maternal w-full max-w-md"
      >
        {step === 1 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Welcome to Janani</h2>
            <p className="text-gray-600 mb-8 font-medium">Where are you in your beautiful journey?</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setData({ ...data, status: 'pregnant' })}
                className={`p-6 rounded-[24px] border-2 text-left transition-all ${data.status === 'pregnant' ? 'border-[#5A5A40] bg-[#5A5A40]/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${data.status === 'pregnant' ? 'bg-[#5A5A40] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5A5A40]">I am Pregnant</h4>
                    <p className="text-xs text-gray-500 mt-1">Personalized tracking for every trimester.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setData({ ...data, status: 'postpartum' })}
                className={`p-6 rounded-[24px] border-2 text-left transition-all ${data.status === 'postpartum' ? 'border-[#5A5A40] bg-[#5A5A40]/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${data.status === 'postpartum' ? 'bg-[#5A5A40] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Baby className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5A5A40]">I am Postpartum</h4>
                    <p className="text-xs text-gray-500 mt-1">Nurturing recovery and mental well-being.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Is this your first time?</h2>
            <p className="text-gray-600 mb-8 font-medium">Knowing this helps Janani personalize your support.</p>
            
            <div className="grid grid-cols-1 gap-4">
              {['1st', '2nd', '3rd'].map((count) => (
                <button 
                  key={count}
                  onClick={() => setData({ ...data, pregnancyCount: count as any })}
                  className={`p-6 rounded-[24px] border-2 text-left transition-all ${data.pregnancyCount === count ? 'border-[#5A5A40] bg-[#5A5A40]/5 shadow-inner' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}
                >
                  <span className="font-bold text-[#5A5A40] capitalize tracking-wide">{count} Journey</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Timing</h2>
            <p className="text-gray-600 mb-8">
              {data.status === 'pregnant' 
                ? "When did your beautiful journey begin? (LMP Date)"
                : "When did you welcome your little one? (Delivery Date)"}
            </p>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {data.status === 'pregnant' ? 'Pregnancy Start Date' : 'Delivery Date'}
              </label>
              <input 
                type="date" 
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                value={data.status === 'pregnant' ? data.pregnancyStartDate : data.deliveryDate}
                onChange={(e) => setData({ 
                  ...data, 
                  [data.status === 'pregnant' ? 'pregnancyStartDate' : 'deliveryDate']: e.target.value 
                })}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Safe Hands</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">In case of any crisis or emotional distress, who should we immediately reach out to?</p>
            <div className="space-y-4">
              {data.emergencyContacts.map((contact, i) => (
                <div key={i} className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                  <input 
                    placeholder="Name" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-[#5A5A40]/10 outline-none"
                    value={contact.name}
                    onChange={(e) => updateContact(i, 'name', e.target.value)}
                  />
                  <input 
                    placeholder="Phone" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-[#5A5A40]/10 outline-none"
                    value={contact.phone}
                    onChange={(e) => updateContact(i, 'phone', e.target.value)}
                  />
                  <input 
                    placeholder="Relation (e.g. Partner, Sister)" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-[#5A5A40]/10 outline-none"
                    value={contact.relation}
                    onChange={(e) => updateContact(i, 'relation', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Baby className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Healthcare Provider</h2>
            <p className="text-gray-600 mb-8">
              {data.status === 'pregnant' 
                ? "During your 9th month, we'll enable specialized Labor Watch. Please provide your hospital's emergency contact number."
                : "Who is your primary doctor? Please provide their mobile number for SOS alerts."}
            </p>
            <div className="space-y-4">
              <input 
                placeholder={data.status === 'pregnant' ? "Hospital Mobile Number" : "Doctor's Mobile Number"}
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-mono"
                value={data.hospitalContact}
                onChange={(e) => setData({ ...data, hospitalContact: e.target.value })}
              />
              <p className="text-xs text-gray-400 italic">Janani will send a medical snapshot via WhatsApp to this number during an SOS.</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleNext} 
          className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
        >
          {step === 5 ? "Complete Profile" : "Continue"}
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </motion.div>
    </div>
  );
}
