import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Phone, 
  ShieldCheck, 
  Hospital,
  ChevronRight,
  Bell
} from 'lucide-react';

export default function Settings() {
  const { profile, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = async () => {
    if (formData) {
      await updateProfile(formData);
      setEditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex justify-between items-center">
        <h3 className="serif text-3xl text-[#5A5A40]">Settings</h3>
      </div>

      {/* Profile Info */}
      <section className="card-maternal">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            {profile?.displayName ? (
              <img src={`https://ui-avatars.com/api/?name=${profile.displayName}&background=5A5A40&color=fff`} referrerPolicy="no-referrer" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-800">{profile?.displayName}</h4>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <SettingsLink 
            icon={<ShieldCheck className="text-green-500" />} 
            label="Security & Privacy" 
            sub="Encryption enabled" 
          />
          <SettingsLink 
            icon={<Bell className="text-orange-500" />} 
            label="Notifications" 
            sub="SMS Alerts: Active" 
          />
          <SettingsLink 
            icon={<Hospital className="text-blue-500" />} 
            label="Hospital Info" 
            sub={profile?.hospitalContact || "Not set"} 
          />
        </div>
      </section>

      {/* Emergency Contacts Management */}
      <section className="card-maternal">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[#5A5A40] flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contacts
          </h4>
          <button className="text-xs font-bold text-[#5A5A40] uppercase">Edit</button>
        </div>
        <div className="space-y-4">
          {profile?.emergencyContacts.map((contact, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div>
                <p className="font-bold text-gray-800 text-sm">{contact.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{contact.relation}</p>
              </div>
              <p className="text-xs font-mono text-gray-600">{contact.phone}</p>
            </div>
          ))}
          {!profile?.emergencyContacts.length && (
            <p className="text-gray-400 text-sm italic text-center py-4">No contacts added yet.</p>
          )}
        </div>
      </section>

      {/* Labor Watch Mode */}
      <section className="card-maternal">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="bg-red-50 p-3 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Labor Watch</h4>
              <p className="text-xs text-gray-400">Automatic 9th month hospital sync</p>
            </div>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={profile?.isLaborWatchEnabled} 
              className="sr-only peer"
              onChange={(e) => updateProfile({ isLaborWatchEnabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
          </div>
        </div>
      </section>

      <button 
        onClick={logout}
        className="w-full card-maternal !bg-white flex items-center justify-center gap-3 text-red-500 font-bold border-red-50 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
      
      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
        Janani v1.0.0
      </p>
    </div>
  );
}

function SettingsLink({ icon, label, sub }: { icon: React.ReactNode, label: string, sub: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700">{label}</p>
          <p className="text-[10px] text-gray-400 font-medium">{sub}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </div>
  );
}
