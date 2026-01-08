import React, { useState, useEffect } from 'react';
import { Smartphone, LogOut, ChevronRight, UserCog, Shield, Download, Check, Share } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsInstalled(true);
    }

    // Android Install Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (isIOS) {
        alert("To install on iPhone:\n1. Tap the 'Share' button below in your browser menu.\n2. Scroll down and tap 'Add to Home Screen'.");
        return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
        alert("To install: Tap your browser's menu (⋮) and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  return (
    <div className="pb-32 pt-6 px-6 animate-in fade-in slide-in-from-right duration-500">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Settings</h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden">
             {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserCog size={32} />
                </div>
             )}
          </div>
          <div>
              <h2 className="font-bold text-slate-900 text-lg">{user.fullName}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
      </div>

      <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
             <button onClick={handleInstallClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-slate-900">App Version</div>
                        <div className="text-xs text-slate-500">
                            {isInstalled ? 'App Installed' : 'Install Mobile App'}
                        </div>
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

             <div className="h-[1px] bg-slate-50 mx-4"></div>

             <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Shield size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-slate-900">Privacy & Data</div>
                        <div className="text-xs text-slate-500">Manage your data</div>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
             </button>
          </div>

          <button 
            onClick={onLogout}
            className="w-full bg-white rounded-2xl border border-red-100 p-4 flex items-center justify-center space-x-2 text-red-500 font-bold shadow-sm active:scale-[0.98] transition-transform"
          >
             <LogOut size={20} />
             <span>Sign Out</span>
          </button>
      </div>

      <div className="mt-12 text-center">
          <img src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" className="h-8 mx-auto opacity-50 grayscale mb-2" />
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Verum Academy v2.4.1</p>
      </div>
    </div>
  );
};
