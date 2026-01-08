import React, { useState } from 'react';
import { Calendar, ChevronRight, AlertCircle, Sparkles, TrendingUp, Clock, X, MapPin } from 'lucide-react';
import { Announcement, UserProfile } from '../types';

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Match Schedule Updated',
    content: 'The away game vs Santos has been moved to Saturday, 10:00 AM.',
    date: 'Today',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Media Day Requirements',
    content: 'Full home kit required. Meeting at Field 2.',
    date: 'Yesterday',
    priority: 'normal'
  }
];

interface HomeProps {
    user: UserProfile;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
  const [showSchedule, setShowSchedule] = useState(false);
  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="pb-32 pt-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full relative">
      
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Hello, <span className="text-blue-600">{firstName}.</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Ready to make an impact today?</p>
        </div>
      </div>

      {/* Main Stats Widget - Dark Premium Feel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/20 mb-6 relative overflow-hidden group">
         {/* Abstract Decoration */}
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
         <div className="absolute -left-10 bottom-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Highlights</div>
                    <div className="text-4xl font-black tracking-tight">{Math.floor(Math.random() * 10) + user.stats.goals} <span className="text-lg font-medium text-slate-400">clips</span></div>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <TrendingUp size={24} className="text-emerald-400" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 text-orange-300 mb-1">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase">Pending</span>
                    </div>
                    <div className="text-xl font-bold">1</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center space-x-2 text-emerald-300 mb-1">
                        <Sparkles size={14} />
                        <span className="text-xs font-bold uppercase">Approved</span>
                    </div>
                    <div className="text-xl font-bold">{Math.floor(Math.random() * 5)}</div>
                </div>
            </div>
         </div>
      </div>

      {/* Next Event Ticket */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-900 text-lg">Next Match</h3>
            <button 
                onClick={() => setShowSchedule(true)}
                className="text-blue-600 text-xs font-bold flex items-center hover:underline"
            >
                View Calendar <ChevronRight size={14} />
            </button>
        </div>
        
        <div className="bg-white rounded-3xl p-1 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-50"></div>
                
                <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-slate-800 shadow-sm border border-slate-100">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase">OCT</span>
                        <span className="text-xl leading-none mt-0.5">02</span>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">LEAGUE</span>
                        </div>
                        <div className="font-extrabold text-slate-900 text-lg">vs Palmeiras</div>
                    </div>
                </div>
                
                <div className="flex items-center text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                     <Calendar size={16} className="mr-2 text-slate-400" /> 
                     <span className="font-semibold text-slate-700 mr-2">02:00 PM</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                     <span>Away Field</span>
                </div>
            </div>
        </div>
      </div>

      {/* Announcements */}
      <div>
         <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="font-bold text-slate-900 text-lg">Board</h3>
         </div>
         <div className="space-y-3">
             {announcements.map(notice => (
                 <div key={notice.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group">
                     <div className="flex items-start space-x-4">
                         <div className={`p-2 rounded-xl mt-0.5 transition-colors ${notice.priority === 'high' ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'}`}>
                             <AlertCircle size={20} />
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{notice.title}</h4>
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{notice.date}</span>
                             </div>
                             <p className="text-xs text-slate-500 leading-relaxed font-medium">{notice.content}</p>
                         </div>
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* Schedule Overlay */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white w-full max-w-md rounded-t-[32px] p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-slate-900">Upcoming Matches</h2>
                    <button 
                        onClick={() => setShowSchedule(false)}
                        className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {[
                        { day: '24', month: 'SEP', team: 'Santos FC', time: '10:00 AM', loc: 'Field 2' },
                        { day: '02', month: 'OCT', team: 'Palmeiras', time: '02:00 PM', loc: 'Away' },
                        { day: '10', month: 'OCT', team: 'Vasco da Gama', time: '09:00 AM', loc: 'Main Stadium' },
                    ].map((match, i) => (
                        <div key={i} className="flex items-center space-x-4 border-b border-slate-100 pb-4 last:border-0">
                            <div className="bg-slate-50 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-slate-700 border border-slate-100">
                                <span className="text-[10px] text-slate-400">{match.month}</span>
                                <span>{match.day}</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900">{match.team}</div>
                                <div className="text-xs text-slate-500 flex items-center mt-0.5">
                                    <Clock size={12} className="mr-1" /> {match.time} 
                                    <span className="mx-1.5">•</span> 
                                    <MapPin size={12} className="mr-1" /> {match.loc}
                                </div>
                            </div>
                            <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Details</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 -z-10" onClick={() => setShowSchedule(false)}></div>
        </div>
      )}

    </div>
  );
};