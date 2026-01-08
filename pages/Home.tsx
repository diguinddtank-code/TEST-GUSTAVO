import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Calendar, Clock, TrendingUp, MoreVertical } from 'lucide-react';
import { UserProfile, MediaItem, MatchEvent } from '../types';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface HomeProps {
    user: UserProfile;
    mediaItems: MediaItem[];
    onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const [feedItems, setFeedItems] = useState<MediaItem[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Real Global Feed
    const feedQuery = query(
        collection(db, "media"), 
        orderBy("date", "desc"),
        limit(50)
    );

    const unsubFeed = onSnapshot(feedQuery, (snapshot) => {
        const items: MediaItem[] = [];
        snapshot.forEach(doc => items.push({ ...doc.data(), id: doc.id } as MediaItem));
        setFeedItems(items);
        setLoading(false);
    });

    // 2. Fetch Real Upcoming Matches
    const matchesQuery = query(collection(db, "matches"));
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
        const loaded: MatchEvent[] = [];
        const today = new Date().toISOString().split('T')[0];
        
        snapshot.forEach(doc => {
            const data = doc.data() as MatchEvent;
            if (data.date >= today) {
                loaded.push({ ...data, id: doc.id });
            }
        });
        setMatches(loaded.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });

    return () => {
        unsubFeed();
        unsubMatches();
    };
  }, []);

  const handleLike = async (itemId: string, currentLikes: string[] = []) => {
      const isLiked = currentLikes.includes(user.id);
      const itemRef = doc(db, "media", itemId);
      try {
          if (isLiked) {
              await updateDoc(itemRef, { likes: arrayRemove(user.id) });
          } else {
              await updateDoc(itemRef, { likes: arrayUnion(user.id) });
          }
      } catch (e) { console.error(e); }
  };

  // Robust Relative Time Formatter
  const getTimeAgo = (dateString: string) => {
      if (!dateString) return '';
      const now = new Date();
      const past = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      // Fallback to date
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
  };

  const formatMatchDate = (dateString: string) => {
      try {
          const date = new Date(dateString);
           return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
      } catch (e) {
          return dateString;
      }
  }

  return (
    <div className="pb-32 min-h-full bg-slate-100">
      
      {/* 1. Header & Stats Ticker */}
      <header className="bg-slate-900 text-white pt-6 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-slate-900/20 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                  <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Feed</h2>
                  <h1 className="text-2xl font-black tracking-tight truncate max-w-[200px]">{user.fullName.split(' ')[0]}</h1>
              </div>
              <div 
                onClick={() => onNavigate('profile')}
                className="bg-white/10 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform"
              >
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white">{user.stats.ratingAvg?.toFixed(1) || "N/A"} OVR</span>
              </div>
          </div>

          {/* 2. Match Calendar Carousel (Real Data Only) */}
          <div>
              <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Matches</span>
              </div>
              
              {matches.length === 0 ? (
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                      <Calendar size={24} className="mx-auto text-slate-500 mb-2 opacity-50" />
                      <p className="text-xs font-bold text-slate-400">No matches scheduled by admin.</p>
                  </div>
              ) : (
                  <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 snap-x">
                      {matches.map((match) => (
                          <div key={match.id} className="snap-center flex-shrink-0 w-64 bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                              <div className={`absolute top-0 right-0 px-2 py-1 text-[9px] font-bold rounded-bl-xl z-10 ${match.location === 'Home' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                  {match.location}
                              </div>
                              
                              <div className="flex justify-between items-center mb-3">
                                   <div className="flex flex-col items-center">
                                       <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500">
                                           V
                                       </div>
                                       <span className="text-[10px] font-bold text-slate-400 mt-1">Verum</span>
                                   </div>
                                   <div className="text-lg font-black text-slate-600">VS</div>
                                   <div className="flex flex-col items-center">
                                       <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center font-black">
                                           {match.opponent[0]}
                                       </div>
                                       <span className="text-[10px] font-bold text-white mt-1 max-w-[60px] truncate">{match.opponent}</span>
                                   </div>
                              </div>
                              
                              <div className="flex items-center justify-between bg-black/20 rounded-lg p-2">
                                   <div className="flex items-center space-x-1.5 text-slate-300">
                                       <Calendar size={12} />
                                       <span className="text-[10px] font-bold">{formatMatchDate(match.date)}</span>
                                   </div>
                                   <div className="w-px h-3 bg-white/10"></div>
                                   <div className="flex items-center space-x-1.5 text-emerald-400">
                                       <Clock size={12} />
                                       <span className="text-[10px] font-bold">{match.time}</span>
                                   </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </header>

      {/* 3. The Feed */}
      <div className="px-4 -mt-6 relative z-20 space-y-6">
        {loading ? (
             <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
             </div>
        ) : feedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 size={24} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Community Feed</h3>
                <p className="text-slate-500 text-sm mt-1">No posts yet. Be the first to share your journey!</p>
                <button onClick={() => onNavigate('upload')} className="mt-4 bg-slate-900 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-lg shadow-slate-900/20">
                    Create Post
                </button>
            </div>
        ) : (
            feedItems.map((item) => {
                const isLiked = item.likes?.includes(user.id);
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        key={item.id} 
                        className="bg-white rounded-[32px] shadow-xl shadow-slate-200/60 overflow-hidden"
                    >
                        {/* Author Header */}
                        <div className="p-4 pb-2 flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-sm">
                                        {item.authorAvatar ? (
                                            <img src={item.authorAvatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200 font-bold text-slate-400">
                                                {item.authorName?.[0] || "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white">
                                        <TrendingUp size={10} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{item.authorName || "Verum Athlete"}</h3>
                                    <div className="flex items-center text-[10px] text-slate-400 font-bold mt-0.5 space-x-1">
                                        <span>{getTimeAgo(item.date)}</span>
                                        <span>•</span>
                                        <span className="uppercase text-blue-600">{item.category}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-300 hover:text-slate-600 p-2">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Caption Section (Top) */}
                        <div className="px-5 pb-3">
                            <p className="text-slate-800 text-sm font-medium leading-relaxed">
                                {item.title}
                            </p>
                        </div>

                        {/* Media Content */}
                        <div className="relative w-full bg-black">
                            {item.type === 'video' ? (
                                <video 
                                    src={item.thumbnailUrl} 
                                    className="w-full h-auto max-h-[500px] object-cover" 
                                    controls 
                                    poster={item.thumbnailUrl}
                                />
                            ) : (
                                <img src={item.thumbnailUrl} className="w-full h-auto object-cover" />
                            )}
                            
                            {/* Coach Rating Overlay */}
                            {item.coachRating && (
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-lg px-3 py-1.5 rounded-xl flex flex-col items-center border border-white/50">
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Rating</span>
                                    <span className="text-lg font-black text-blue-600 leading-none">{item.coachRating}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                             <div className="flex space-x-2">
                                 <button 
                                    onClick={() => handleLike(item.id, item.likes)}
                                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-slate-200 text-slate-500'}`}
                                 >
                                     <Heart size={20} className={isLiked ? "fill-current" : ""} />
                                     <span className="text-xs font-bold">{item.likes?.length || 0}</span>
                                 </button>
                                 <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-all">
                                     <MessageCircle size={20} />
                                     <span className="text-xs font-bold">Comment</span>
                                 </button>
                             </div>
                             <button className="text-slate-400 hover:text-slate-600">
                                 <Share2 size={20} />
                             </button>
                        </div>
                    </motion.div>
                );
            })
        )}
      </div>
    </div>
  );
};
