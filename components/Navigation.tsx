import React from 'react';
import { Home, Calendar, Plus, User, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Feed' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' }, // Changed to Agenda
    { id: 'upload', icon: Plus, label: 'Post', isMain: true },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: SettingsIcon, label: 'Menu' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden pb-6">
      <nav className="bg-white/90 backdrop-blur-xl pointer-events-auto w-[92%] max-w-md rounded-3xl shadow-2xl shadow-slate-300/50 border border-white/40 px-2 py-3 mb-2 ring-1 ring-black/5">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            if (item.isMain) {
                return (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onTabChange(item.id)}
                        className="flex-1 flex justify-center -mt-10"
                    >
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all ${isActive ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'} ring-8 ring-slate-50`}>
                            <Icon size={30} strokeWidth={2.5} />
                        </div>
                    </motion.button>
                )
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center space-y-1 py-1 relative`}
              >
                 <div className="relative p-2">
                    <Icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                    />
                    {isActive && (
                        <motion.div 
                            layoutId="nav-pill"
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-900 rounded-full"
                        />
                    )}
                 </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
