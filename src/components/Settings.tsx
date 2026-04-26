import React, { useState } from 'react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
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
  const [formData, setFormData] = useState<UserProfile | null>(profile);
  const [editingEmergency, setEditingEmergency] = useState(false);

  const handleSave = async () => {
    if (formData) {
      await updateProfile(formData);
      setEditing(false);
      setEditingEmergency(false);
    }
  };

  const addEmergencyContact = () => {
    if (formData) {
      setFormData({
        ...formData,
        emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }]
      });
    }
  };

  const removeEmergencyContact = (index: number) => {
    if (formData) {
      const newContacts = [...formData.emergencyContacts];
      newContacts.splice(index, 1);
      setFormData({ ...formData, emergencyContacts: newContacts });
    }
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    if (formData) {
      const newContacts = [...formData.emergencyContacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      setFormData({ ...formData, emergencyContacts: newContacts });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex justify-between items-center">
        <h3 className="serif text-3xl text-[#5A5A40]">Settings</h3>
        {editing || editingEmergency ? (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setEditingEmergency(false); setFormData(profile); }} className="text-xs font-bold text-gray-400 uppercase">Cancel</button>
            <button onClick={handleSave} className="text-xs font-bold text-[#5A5A40] uppercase">Save Changes</button>
          </div>
        ) : null}
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
            sub="WhatsApp Alerts: Active" 
          />
          <div className="relative group">
            <SettingsLink 
              icon={<Hospital className="text-blue-500" />} 
              label="Hospital/Doctor Contact" 
              sub={profile?.hospitalContact || "Not set"} 
              onClick={() => setEditing(true)}
            />
            {editing && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
                <input 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#5A5A40]/10 outline-none font-mono"
                  placeholder="Doctor's Mobile Number"
                  value={formData?.hospitalContact || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, hospitalContact: e.target.value } : null)}
                />
            <p className="text-[10px] text-gray-400 mt-2 ml-1">Enter a valid 10-digit number or E.164 format (+91...). Ensure number is registered on WhatsApp.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Emergency Contacts Management */}
      <section className="card-maternal">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-[#5A5A40] flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contacts
          </h4>
          {!editingEmergency && (
            <button onClick={() => setEditingEmergency(true)} className="text-xs font-bold text-[#5A5A40] uppercase">Edit</button>
          )}
        </div>
        
        <div className="space-y-4">
          {(editingEmergency ? formData?.emergencyContacts : profile?.emergencyContacts)?.map((contact, i) => (
            <div key={i} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              {editingEmergency ? (
                <>
                  <div className="flex justify-between">
                    <input 
                      placeholder="Name" 
                      className="flex-1 p-2 bg-white rounded-lg border border-gray-100 text-sm mr-2"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(i, 'name', e.target.value)}
                    />
                    <button onClick={() => removeEmergencyContact(i)} className="text-red-400 p-2">
                      <LogOut className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                  <input 
                    placeholder="Phone" 
                    className="w-full p-2 bg-white rounded-lg border border-gray-100 text-sm font-mono"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(i, 'phone', e.target.value)}
                  />
                  <input 
                    placeholder="Relation" 
                    className="w-full p-2 bg-white rounded-lg border border-gray-100 text-sm"
                    value={contact.relation}
                    onChange={(e) => updateEmergencyContact(i, 'relation', e.target.value)}
                  />
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{contact.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{contact.relation}</p>
                  </div>
                  <p className="text-xs font-mono text-gray-600">{contact.phone}</p>
                </div>
              )}
            </div>
          ))}

          {editingEmergency && (
            <button 
              onClick={addEmergencyContact}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 uppercase hover:border-[#5A5A40] hover:text-[#5A5A40] transition-colors"
            >
              + Add Contact
            </button>
          )}

          {!profile?.emergencyContacts.length && !editingEmergency && (
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

function SettingsLink({ icon, label, sub, onClick }: { icon: React.ReactNode, label: string, sub: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
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
