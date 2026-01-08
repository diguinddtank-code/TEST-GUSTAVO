import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile, MediaItem } from '../types';
import { Search, LogOut, Shield, Play, Star, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from './Profile';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [view, setView] = useState<'users' | 'review'>('review');
    const [athletes, setAthletes] = useState<UserProfile[]>([]);
    const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
    
    // Detailed Athlete View
    const [selectedAthlete, setSelectedAthlete] = useState<UserProfile | null>(null);
    const [selectedAthleteMedia, setSelectedAthleteMedia] = useState<MediaItem[]>([]);

    // Review Modal State
    const [reviewItem, setReviewItem] = useState<MediaItem | null>(null);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch Pending Media
        const qMedia = query(collection(db, "media"), where("status", "==", "pending"));
        const mediaSnap = await getDocs(qMedia);
        const media: MediaItem[] = [];
        mediaSnap.forEach((doc) => media.push({ ...doc.data(), id: doc.id } as MediaItem));
        setPendingMedia(media);

        // Fetch Athletes with Safety Checks
        const qUsers = query(collection(db, "users"), where("role", "==", "athlete"));
        const userSnap = await getDocs(qUsers);
        const users: UserProfile[] = [];
        userSnap.forEach((doc) => {
            const data = doc.data();
            // Protect against old data structure
            users.push({
                ...data,
                id: doc.id,
                stats: data.stats || { matches: 0, goals: 0, assists: 0 },
                physical: data.physical || { height: '-', weight: '-', foot: '-', age: '-' },
                role: data.role || 'athlete'
            } as UserProfile);
        });
        setAthletes(users);
    };

    const handleViewAthlete = async (athlete: UserProfile) => {
        // Fetch media for this athlete
        const q = query(collection(db, "media"), where("userId", "==", athlete.id));
        const snapshot = await getDocs(q);
        const items: MediaItem[] = [];
        snapshot.forEach((doc) => {
            items.push({ ...doc.data(), id: doc.id } as MediaItem);
        });
        
        setSelectedAthleteMedia(items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setSelectedAthlete(athlete);
    };

    const submitReview = async (status: 'approved' | 'rejected') => {
        if (!reviewItem) return;

        try {
            const mediaRef = doc(db, "media", reviewItem.id);
            await updateDoc(mediaRef, {
                status: status,
                coachRating: rating,
                coachFeedback: feedback,
                reviewedAt: new Date().toISOString()
            });

            // Optimistic Update
            setPendingMedia(prev => prev.filter(i => i.id !== reviewItem.id));
            setReviewItem(null);
            setRating(5);
            setFeedback('');
        } catch (e) {
            console.error(e);
            alert("Error saving review");
        }
    };

    const getAthleteName = (uid: string) => {
        return athletes.find(a => a.id === uid)?.fullName || "Unknown Athlete";
    };

    // If viewing a single athlete profile
    if (selectedAthlete) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 shadow-md flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedAthlete(null)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-none">{selectedAthlete.fullName}</h2>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Full Admin Access</span>
                    </div>
                </div>
                {/* Reuse Profile Component with Admin Flag */}
                <Profile 
                    user={selectedAthlete} 
                    mediaItems={selectedAthleteMedia} 
                    onUpdateUser={(updated) => {
                        setSelectedAthlete(updated);
                        setAthletes(prev => prev.map(a => a.id === updated.id ? updated : a));
                    }}
                    isAdmin={true}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Pro Header */}
            <div className="bg-slate-900 text-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-2xl shadow-slate-900/20 z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                            <Shield size={12} />
                            <span>Staff Access</span>
                        </div>
                        <h1 className="text-2xl font-extrabold">Scouting Portal</h1>
                    </div>
                    <button onClick={onLogout} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Switcher */}
                <div className="bg-slate-800 p-1 rounded-xl flex">
                    <button 
                        onClick={() => setView('review')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'review' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Pending Reviews ({pendingMedia.length})
                    </button>
                    <button 
                        onClick={() => setView('users')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Athlete DB
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {view === 'review' ? (
                    <div className="space-y-4">
                        {pendingMedia.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                                <h3 className="font-bold text-slate-900">All caught up!</h3>
                                <p className="text-sm">No pending media to review.</p>
                            </div>
                        ) : (
                            pendingMedia.map(item => (
                                <motion.div 
                                    layoutId={item.id}
                                    key={item.id}
                                    onClick={() => setReviewItem(item)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:border-blue-200 transition-colors"
                                >
                                    <div className="w-24 h-24 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {item.type === 'video' && <Play size={20} className="text-white fill-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 py-1">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">
                                            {item.category}
                                        </span>
                                        <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium">By {getAthleteName(item.userId)}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">{item.date}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                         {athletes.map(a => (
                             <div 
                                key={a.id} 
                                onClick={() => handleViewAthlete(a)}
                                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.98]"
                             >
                                 <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                                     {a.avatarUrl ? (
                                        <img src={a.avatarUrl} className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{a.fullName[0]}</div>
                                     )}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <h3 className="font-bold text-slate-900 truncate">{a.fullName}</h3>
                                     <p className="text-xs text-slate-500">{a.position} • {a.club}</p>
                                 </div>
                                 <div className="ml-auto text-right flex-shrink-0">
                                     <div className="text-xs font-bold text-slate-900">{a.stats?.matches || 0} Gms</div>
                                     <div className="text-[10px] text-slate-400">Stats</div>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                        >
                             <div className="aspect-video bg-black relative">
                                {reviewItem.type === 'video' ? (
                                    <video src={reviewItem.thumbnailUrl} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={reviewItem.thumbnailUrl} className="w-full h-full object-cover" />
                                )}
                                <button onClick={() => setReviewItem(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full">
                                    <XCircle size={20} />
                                </button>
                             </div>

                             <div className="p-6">
                                 <h2 className="font-bold text-lg mb-4">Coach Review</h2>
                                 
                                 <div className="mb-4">
                                     <label className="text-xs font-bold text-slate-500 uppercase">Rating (0-10)</label>
                                     <div className="flex items-center gap-2 mt-2">
                                         <input 
                                            type="range" min="0" max="10" 
                                            value={rating} 
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                         />
                                         <span className="font-black text-blue-600 text-lg w-8 text-center">{rating}</span>
                                     </div>
                                 </div>

                                 <div className="mb-6">
                                     <label className="text-xs font-bold text-slate-500 uppercase">Feedback</label>
                                     <textarea 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                        placeholder="What did they do well? What needs improvement?"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                     ></textarea>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                     <button 
                                        onClick={() => submitReview('rejected')}
                                        className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200"
                                     >
                                         Reject
                                     </button>
                                     <button 
                                        onClick={() => submitReview('approved')}
                                        className="py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30"
                                     >
                                         Approve & Send
                                     </button>
                                 </div>
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};