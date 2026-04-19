import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Users, Calendar, Phone, Heart } from 'lucide-react';

export default function Onboarding() {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    pregnancyStartDate: '',
    emergencyContacts: [{ name: '', phone: '', relation: '' }],
    hospitalContact: ''
  });

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await updateProfile({
        ...data,
        onboardingComplete: true,
        currentTrimester: calculateTrimester(data.pregnancyStartDate)
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
              <Calendar className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Hello {profile?.displayName?.split(' ')[0]}</h2>
            <p className="text-gray-600 mb-8">To personalize your journey, we need to know when your beautiful journey began.</p>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Pregnancy Start Date (LMP)</label>
              <input 
                type="date" 
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                value={data.pregnancyStartDate}
                onChange={(e) => setData({ ...data, pregnancyStartDate: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Safe Hands</h2>
            <p className="text-gray-600 mb-8">In case of any crisis, who should we immediately reach out to?</p>
            <div className="space-y-4">
              {data.emergencyContacts.map((contact, i) => (
                <div key={i} className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                  <input 
                    placeholder="Name" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm"
                    value={contact.name}
                    onChange={(e) => updateContact(i, 'name', e.target.value)}
                  />
                  <input 
                    placeholder="Phone" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm"
                    value={contact.phone}
                    onChange={(e) => updateContact(i, 'phone', e.target.value)}
                  />
                  <input 
                    placeholder="Relation (e.g. Partner, Sister)" 
                    className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm"
                    value={contact.relation}
                    onChange={(e) => updateContact(i, 'relation', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-[#5A5A40]/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-[#5A5A40]" />
            </div>
            <h2 className="serif text-3xl mb-4 text-[#5A5A40]">Medical Care</h2>
            <p className="text-gray-600 mb-8">During your 9th month, we'll enable specialized Labor Watch. Which hospital should we notify?</p>
            <div className="space-y-4">
              <input 
                placeholder="Hospital Name or Doctor's Number" 
                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                value={data.hospitalContact}
                onChange={(e) => setData({ ...data, hospitalContact: e.target.value })}
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleNext} 
          className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
        >
          {step === 3 ? "Complete Profile" : "Continue"}
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </motion.div>
    </div>
  );
}
