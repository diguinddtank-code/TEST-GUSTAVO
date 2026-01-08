import React, { useState } from 'react';
import { Calendar, ChevronRight, AlertCircle, Sparkles, TrendingUp, Clock, MapPin, Activity } from 'lucide-react';
import { Announcement, UserProfile, MediaItem } from '../types';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HomeProps {
    user: UserProfile;
    mediaItems: MediaItem[];
    onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, mediaItems, onNavigate }) => {
  const [showSchedule, setShowSchedule] = useState(false);
  const firstName = user.fullName.split(' ')[0];

  // Calculate Stats
  const approvedCount = mediaItems.filter(i => i.status === 'approved').length;
  const pendingCount = mediaItems.filter(i => i.status === 'pending').length;
  
  // Mock Data for Chart (would come from DB in real prod)
  const data = [
    { name: 'Jan', performance: 65 },
    { name: 'Feb', performance: 70 },
    { name: 'Mar', performance: 68 },
    { name: 'Apr', performance: 85 },
    { name: 'May', performance: 82 },
    { name: 'Jun', performance: 90 },
  ];

  return (
    <div className="pb-32 pt-4 px-6 min-h-full">
      
      {/* Welcome & Context */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ready to work,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">{firstName}?</span>
        </h1>
      </motion.div>

      {/* Performance Card (Chart) */}
      <motion.div 
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl shadow-slate-900/30 mb-6 relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Performance Index</div>
                    <div className="text-3xl font-black tracking-tight flex items-end">
                        92.4 <span className="text-sm font-bold text-emerald-400 mb-1 ml-2 flex items-center"><TrendingUp size={14} className="mr-1"/> +2.4%</span>
                    </div>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl">
                    <Activity className="text-blue-400" size={24} />
                </div>
            </div>

            {/* Recharts Graph */}
            <div className="h-32 w-full -ml-4">
                <ResponsiveContainer width="110%" height="100%">
                    <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
                    <Area type="monotone" dataKey="performance" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>
      </motion.div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('gallery')}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-start relative overflow-hidden group"
          >
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock size={48} />
              </div>
              <div className="bg-orange-50 text-orange-600 p-2 rounded-xl mb-2">
                  <Clock size={20} />
              </div>
              <span className="text-3xl font-black text-slate-900">{pendingCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('gallery')}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-start relative overflow-hidden group"
          >
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles size={48} />
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl mb-2">
                  <Sparkles size={20} />
              </div>
              <span className="text-3xl font-black text-slate-900">{approvedCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Clips</span>
          </motion.button>
      </div>

      {/* Next Match Ticket */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-900 text-lg">Next Match</h3>
            <button 
                onClick={() => setShowSchedule(true)}
                className="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
            >
                Calendar <ChevronRight size={14} />
            </button>
        </div>
        
        <div className="bg-white rounded-[28px] p-2 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="bg-slate-50 rounded-[22px] p-5 border border-slate-100 relative overflow-hidden">
                {/* Team Logos (Mock) */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-900 mb-2">VER</div>
                        <span className="text-xs font-bold text-slate-500">Verum</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">VS</span>
                        <span className="text-xl font-black text-slate-900">14:00</span>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-900 mb-2">SAN</div>
                        <span className="text-xs font-bold text-slate-500">Santos</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-center text-xs font-bold text-slate-500 bg-white py-3 rounded-xl border border-slate-100 shadow-sm">
                     <Calendar size={14} className="mr-2 text-blue-500" /> 
                     <span>Oct 02</span>
                     <span className="mx-3 text-slate-300">|</span>
                     <MapPin size={14} className="mr-2 text-blue-500" /> 
                     <span>Away Field</span>
                </div>
            </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="space-y-3">
         <h3 className="font-bold text-slate-900 text-lg px-1">Academy Board</h3>
         {[1].map((notice) => (
             <div key={notice} className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="flex items-start space-x-3 relative z-10">
                     <AlertCircle size={20} className="text-blue-200 mt-0.5" />
                     <div>
                         <h4 className="font-bold text-lg mb-1">Schedule Update</h4>
                         <p className="text-sm text-blue-100 leading-relaxed font-medium">Training tomorrow is moved to Field 4 due to maintenance.</p>
                     </div>
                 </div>
             </div>
         ))}
      </div>

      {/* Schedule Modal (Simplified for brevity) */}
      {showSchedule && (
        <div 
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowSchedule(false)}
        >
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Upcoming Fixtures</h2>
                <p className="text-slate-500 text-sm">Full season calendar available in PDF.</p>
            </motion.div>
        </div>
      )}

    </div>
  );
};