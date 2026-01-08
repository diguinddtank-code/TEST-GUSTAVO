import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, AlertCircle, Sparkles, TrendingUp, Clock, MapPin, Activity, Plus, CheckCircle2, X } from 'lucide-react';
import { Announcement, UserProfile, MediaItem, MatchEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface HomeProps {
    user: UserProfile;
    mediaItems: MediaItem[];
    onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, mediaItems, onNavigate }) => {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [nextMatch, setNextMatch] = useState<MatchEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats Logic for New Match
  const [newMatch, setNewMatch] = useState<Partial<MatchEvent>>({
      opponent: '', date: '', time: '', location: '', type: 'League', homeOrAway: 'Home'
  });

  const firstName = user.fullName.split(' ')[0];
  const approvedCount = mediaItems.filter(i => i.status === 'approved').length;
  const pendingCount = mediaItems.filter(i => i.status === 'pending').length;

  useEffect(() => {
    const q = query(collection(db, "matches"), where("userId", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMatches: MatchEvent[] = [];
        snapshot.forEach(doc => fetchedMatches.push({ ...doc.data(), id: doc.id } as MatchEvent));
        
        // Sort matches by date
        const sorted = fetchedMatches.sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        setMatches(sorted);

        // Find Next Match
        const now = new Date();
        const upcoming = sorted.find(m => new Date(`${m.date}T${m.time}`) > now);
        setNextMatch(upcoming || null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id]);

  const handleAddMatch = async () => {
    if(!newMatch.opponent || !newMatch.date) return;
    
    try {
        await addDoc(collection(db, "matches"), {
            ...newMatch,
            userId: user.id,
            status: 'scheduled'
        });
        setShowMatchModal(false);
        setNewMatch({ opponent: '', date: '', time: '', location: '', type: 'League', homeOrAway: 'Home' });
    } catch(e) {
        console.error(e);
    }
  };

  const handleCompleteMatch = async (match: MatchEvent) => {
    // In a real app, open a modal to input stats. For now, we simulate logging.
    const result = prompt("Match Result (e.g. 2-1)?", "0-0");
    const rating = prompt("Your Rating (1-10)?", "7");
    if(rating) {
        const matchRef = doc(db, "matches", match.id);
        await updateDoc(matchRef, {
            status: 'completed',
            result: result || "-",
            userStats: {
                rating: Number(rating),
                goals: 0,
                assists: 0,
                minutes: 90
            }
        });
    }
  };

  // Prepare Chart Data
  const chartData = matches
    .filter(m => m.status === 'completed' && m.userStats)
    .map(m => ({
        name: m.opponent.substring(0,3),
        performance: m.userStats?.rating || 0
    }));

  // If no data, use a flat line or placeholder
  const finalChartData = chartData.length > 0 ? chartData : [{name: 'Start', performance: 5}, {name: 'Now', performance: 5}];
  const latestRating = chartData.length > 0 ? chartData[chartData.length - 1].performance : 0;

  return (
    <div className="pb-32 pt-4 px-6 min-h-full">
      
      {/* Welcome & Context */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-end"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ready to work,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">{firstName}?</span>
        </h1>
        <button 
            onClick={() => setShowMatchModal(true)}
            className="bg-slate-900 text-white p-3 rounded-full shadow-lg shadow-slate-900/30 hover:scale-105 transition-transform"
        >
            <Plus size={20} />
        </button>
      </motion.div>

      {/* Performance Card */}
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
                        {latestRating > 0 ? latestRating.toFixed(1) : "-"} 
                        {chartData.length > 1 && (
                            <span className="text-sm font-bold text-emerald-400 mb-1 ml-2 flex items-center">
                                <TrendingUp size={14} className="mr-1"/> Recent
                            </span>
                        )}
                    </div>
                </div>
                <div className="bg-white/10 p-2.5 rounded-2xl">
                    <Activity className="text-blue-400" size={24} />
                </div>
            </div>

            {/* Recharts Graph */}
            <div className="h-32 w-full -ml-4">
                <ResponsiveContainer width="110%" height="100%">
                    <AreaChart data={finalChartData}>
                    <defs>
                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
                    <Area 
                        type="monotone" 
                        dataKey="performance" 
                        stroke="#60a5fa" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorPerf)" 
                        baseLine={0}
                    />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {chartData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold">
                    Log a match to see stats
                </div>
            )}
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
                onClick={() => setShowMatchModal(true)}
                className="text-blue-600 text-xs font-bold flex items-center hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
            >
                Schedule <ChevronRight size={14} />
            </button>
        </div>
        
        {nextMatch ? (
            <div className="bg-white rounded-[28px] p-2 shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="bg-slate-50 rounded-[22px] p-5 border border-slate-100 relative overflow-hidden">
                    {/* Team Logos (Mock) */}
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="text-center w-1/3">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-900 mb-2 mx-auto">YOU</div>
                            <span className="text-xs font-bold text-slate-500 block truncate">{user.club || "Verum"}</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{nextMatch.type}</span>
                            <span className="text-xl font-black text-slate-900">{nextMatch.time}</span>
                        </div>
                        <div className="text-center w-1/3">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-900 mb-2 mx-auto">VS</div>
                            <span className="text-xs font-bold text-slate-500 block truncate">{nextMatch.opponent}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-xs font-bold text-slate-500 bg-white py-3 rounded-xl border border-slate-100 shadow-sm gap-3">
                        <div className="flex items-center"><Calendar size={14} className="mr-1 text-blue-500" /> {nextMatch.date}</div>
                        <div className="w-[1px] h-3 bg-slate-200"></div>
                        <div className="flex items-center"><MapPin size={14} className="mr-1 text-blue-500" /> {nextMatch.location || "Field"}</div>
                    </div>
                </div>
                <button 
                    onClick={() => handleCompleteMatch(nextMatch)}
                    className="w-full mt-2 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                    Log Result & Stats
                </button>
            </div>
        ) : (
            <div 
                onClick={() => setShowMatchModal(true)}
                className="bg-white border-2 border-dashed border-slate-200 rounded-[28px] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
            >
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Calendar size={24} className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-500">No upcoming matches</p>
                <p className="text-xs text-blue-500 font-bold mt-1">Tap to add schedule</p>
            </div>
        )}
      </div>

      {/* Add Match Modal */}
      <AnimatePresence>
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMatchModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-[32px] p-6 relative z-10 shadow-2xl"
            >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Match</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Opponent</label>
                        <input 
                            value={newMatch.opponent}
                            onChange={e => setNewMatch({...newMatch, opponent: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-500"
                            placeholder="e.g. Santos FC"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
                            <input 
                                type="date"
                                value={newMatch.date}
                                onChange={e => setNewMatch({...newMatch, date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Time</label>
                            <input 
                                type="time"
                                value={newMatch.time}
                                onChange={e => setNewMatch({...newMatch, time: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Location</label>
                        <input 
                            value={newMatch.location}
                            onChange={e => setNewMatch({...newMatch, location: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-blue-500"
                            placeholder="e.g. Main Stadium"
                        />
                    </div>
                    <div className="flex gap-2">
                         {['League', 'Friendly', 'Cup', 'Training'].map(t => (
                             <button 
                                key={t}
                                onClick={() => setNewMatch({...newMatch, type: t as any})}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newMatch.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                             >
                                 {t}
                             </button>
                         ))}
                    </div>
                </div>

                <button 
                    onClick={handleAddMatch}
                    disabled={!newMatch.opponent || !newMatch.date}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-8 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                    Schedule Match
                </button>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};