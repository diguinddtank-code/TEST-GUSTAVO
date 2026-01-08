import React, { useState, useEffect } from 'react';
import { Smartphone, LogOut, ChevronRight, UserCog, Shield, Download, Check, Share, User, Calendar, Phone, Mail } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Personal Info Form
  const [form, setForm] = useState({
      phone: user.phone || '',
      dob: user.dob || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsInstalled(true);
    }
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;
    if (isIOS) { alert("To install on iPhone:\n1. Tap 'Share'\n2. 'Add to Home Screen'"); return; }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { setDeferredPrompt(null); setIsInstalled(true); }
    } else { alert("To install: Tap browser menu (⋮) -> 'Add to Home Screen'."); }
  };

  const savePersonalInfo = async () => {
      setIsSaving(true);
      try {
          await updateDoc(doc(db, "users", user.id), {
              phone: form.phone,
              dob: form.dob
          });
          alert("Info updated");
      } catch(e) { console.error(e); }
      setIsSaving(false);
  }

  return (
    <div className="pb-32 pt-6 px-6 animate-in fade-in slide-in-from-right duration-500">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Settings</h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
             {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><UserCog size={32} /></div>}
          </div>
          <div>
              <h2 className="font-bold text-slate-900 text-lg">{user.fullName}</h2>
              <p className="text-slate-500 text-sm">{user.role.toUpperCase()}</p>
          </div>
      </div>

      {/* Personal Info Section */}
      <div className="mb-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Personal Information</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-4 space-y-4">
              <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1"><Mail size={12}/> Email (Read-Only)</label>
                  <input value={user.email} disabled className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm font-bold text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1"><Phone size={12}/> Phone</label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+1 234 567 890" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1"><Calendar size={12}/> Date of Birth</label>
                  <input 
                    type="date"
                    value={form.dob} 
                    onChange={e => setForm({...form, dob: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
              </div>
              <button onClick={savePersonalInfo} disabled={isSaving} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
                  {isSaving ? 'Saving...' : 'Update Info'}
              </button>
          </div>
      </div>

      <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">App</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
             <button onClick={handleInstallClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-slate-900">App Version</div>
                        <div className="text-xs text-slate-500">{isInstalled ? 'App Installed' : 'Install Mobile App'}</div>
                    </div>
                </div>
                {isInstalled ? <Check size={20} className="text-emerald-500" /> : <Download size={20} className="text-slate-300" />}
             </button>
             {isIOS && !isInstalled && (
                 <div className="px-4 py-3 bg-blue-50 text-blue-800 text-xs font-medium leading-relaxed">
                     <strong className="block mb-1">iOS Installation:</strong>
                     Tap the <Share size={12} className="inline mx-1" /> Share button in Safari, then select "Add to Home Screen".
                 </div>
             )}
          </div>

          <button onClick={onLogout} className="w-full bg-white rounded-2xl border border-red-100 p-4 flex items-center justify-center space-x-2 text-red-500 font-bold shadow-sm active:scale-[0.98] transition-transform">
             <LogOut size={20} />
             <span>Sign Out</span>
          </button>
      </div>

      <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Verum Academy v2.5.0</p>
      </div>
    </div>
  );
};
