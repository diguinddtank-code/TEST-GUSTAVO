import React from 'react';
import { LayoutDashboard, Image, Plus, Bell, User, Settings as SettingsIcon } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'gallery', icon: Image, label: 'Media' },
    { id: 'upload', icon: Plus, label: 'Upload', isMain: true },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden pb-6">
      <nav className="glass-nav pointer-events-auto w-[92%] max-w-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 px-2 py-3 mb-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            if (item.isMain) {
                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className="flex-1 flex justify-center -mt-8"
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-slate-900 text-white ring-4 ring-white' : 'bg-blue-600 text-white ring-4 ring-white'}`}>
                            <Icon size={28} strokeWidth={2.5} />
                        </div>
                    </button>
                )
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 transition-all duration-300 group ${
                  isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'bg-slate-100' : 'bg-transparent'}`}>
                    <Icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-all ${isActive ? 'scale-110' : 'group-active:scale-90'}`}
                    />
                    {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full"></div>}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};