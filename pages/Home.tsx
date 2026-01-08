
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Calendar, Clock, TrendingUp, MoreVertical, Volume2, VolumeX, Send, X } from 'lucide-react';
import { UserProfile, MediaItem, MatchEvent, Comment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, addDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface HomeProps {
    user: UserProfile;
    mediaItems: MediaItem[];
    onNavigate: (tab: string) => void;
}

// Robust Time Ago Function
const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'Just now';
    
    try {
        const now = new Date();
        const past = new Date(dateString);
        
        // Invalid date check
        if (isNaN(past.getTime())) return 'Just now';

        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
    } catch (e) {
        return 'Just now';
    }
};

const CommentsSheet: React.FC<{ mediaId: string; user: UserProfile; onClose: () => void }> = ({ mediaId, user, onClose }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // FIX: Removed orderBy("createdAt", "asc") from Firestore query to prevent "Index Required" error.
        // We sort client-side below instead.
        const q = query(collection(db, "comments"), where("mediaId", "==", mediaId));
        
        const unsub = onSnapshot(q, (snap) => {
            const loaded: Comment[] = [];
            snap.forEach(d => loaded.push({ ...d.data(), id: d.id } as Comment));
            
            // Sort client-side
            loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            
            setComments(loaded);
            setLoading(false);
        });
        return () => unsub();
    }, [mediaId]);

    const handleSend = async () => {
        if (!newComment.trim()) return;
        const text = newComment;
        setNewComment(''); // Optimistic clear

        try {
            await addDoc(collection(db, "comments"), {
                mediaId,
                userId: user.id,
                text,
                createdAt: new Date().toISOString(),
                authorName: user.fullName,
                authorAvatar: user.avatarUrl
            });
            
            // Update comment count on media item (Optional: Cloud Function is better for this, but client-side works for MVP)
            const mediaRef = doc(db, "media", mediaId);
            // We can't easily increment without knowing current count reliably without a transaction, 
            // but for UI feedback we rely on the realtime listener of the feed.
            // A simple updateDoc to trigger a change event:
             /* await updateDoc(mediaRef, { lastCommentAt: new Date().toISOString() }); */
        } catch (e) {
            console.error("Failed to comment", e);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-slate-50 w-full sm:max-w-md h-[75vh] sm:h-[600px] rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                    <h3 className="font-bold text-slate-900">Comments</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div></div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No comments yet. Be the first!</div>
                    ) : (
                        comments.map(c => (
                            <div key={c.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    {c.authorAvatar ? <img src={c.authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-[10px]">{c.authorName[0]}</div>}
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-900">{c.authorName}</span>
                                        <span className="text-[10px] text-slate-400">{getTimeAgo(c.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-snug">{c.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 bg-white border-t border-slate-200 pb-8 sm:pb-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex-shrink-0 ml-1">
                             {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-[10px]">{user.fullName[0]}</div>}
                        </div>
                        <input 
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!newComment.trim()}
                            className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-400 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Sub-component for individual feed items
const FeedCard: React.FC<{ item: MediaItem; user: UserProfile; onLike: (id: string, likes: string[]) => void; onComment: (id: string) => void }> = ({ item, user, onLike, onComment }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const isLiked = item.likes?.includes(user.id);

    useEffect(() => {
        if (item.type !== 'video') return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            }, { threshold: 0.6 }
        );
        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, [item.type]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="bg-white rounded-[32px] shadow-xl shadow-slate-200/60 overflow-hidden mb-6"
        >
            {/* Header */}
            <div className="p-4 pb-3 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                            {item.authorAvatar ? (
                                <img src={item.authorAvatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 font-bold text-slate-400 text-xs">
                                    {item.authorName?.[0] || "?"}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{item.authorName || "Athlete"}</h3>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold mt-0.5 space-x-1">
                            <span>{getTimeAgo(item.date)}</span>
                            <span>•</span>
                            <span className="text-blue-600">{item.category}</span>
                        </div>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Caption */}
            <div className="px-5 pb-3">
                <p className="text-slate-800 text-sm font-medium leading-relaxed">{item.title}</p>
            </div>

            {/* Media */}
            <div className="relative w-full bg-black aspect-[4/5] sm:aspect-square overflow-hidden bg-slate-900">
                {item.type === 'video' ? (
                    <>
                        <video 
                            ref={videoRef}
                            src={item.thumbnailUrl} 
                            className="w-full h-full object-cover"
                            playsInline
                            loop
                            muted
                        />
                        <button 
                            onClick={toggleMute}
                            className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full transition-all hover:bg-black/70 active:scale-95"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </>
                ) : (
                    <img src={item.thumbnailUrl} className="w-full h-full object-cover" />
                )}
                
                {/* Rating Badge Overlay */}
                {item.coachRating && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-lg px-3 py-1.5 rounded-xl flex flex-col items-center border border-white/50">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Rating</span>
                        <span className="text-xl font-black text-blue-600 leading-none">{item.coachRating}</span>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => onLike(item.id, item.likes || [])}
                            className={`flex items-center space-x-1.5 transition-all ${isLiked ? 'text-red-500 scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Heart size={24} className={isLiked ? "fill-current" : ""} />
                            <span className="text-xs font-bold">{item.likes?.length || 0}</span>
                        </button>
                        <button 
                            onClick={() => onComment(item.id)}
                            className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 transition-all"
                        >
                            <MessageCircle size={24} />
                            <span className="text-xs font-bold">Comment</span>
                        </button>
                        <button className="text-slate-400 hover:text-slate-600">
                            <Share2 size={24} />
                        </button>
                    </div>
            </div>
        </motion.div>
    );
};

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const [feedItems, setFeedItems] = useState<MediaItem[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment System
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch Real Global Feed
    const feedQuery = query(collection(db, "media"), orderBy("date", "desc"), limit(50));
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
            if (data.date >= today) loaded.push({ ...data, id: doc.id });
        });
        setMatches(loaded.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });

    return () => { unsubFeed(); unsubMatches(); };
  }, []);

  const handleLike = async (itemId: string, currentLikes: string[]) => {
      const isLiked = currentLikes.includes(user.id);
      const itemRef = doc(db, "media", itemId);
      try {
          if (isLiked) await updateDoc(itemRef, { likes: arrayRemove(user.id) });
          else await updateDoc(itemRef, { likes: arrayUnion(user.id) });
      } catch (e) { console.error(e); }
  };

  const formatMatchDate = (dateString: string) => {
      try {
          const date = new Date(dateString);
           return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
      } catch (e) { return dateString; }
  }

  return (
    <div className="pb-32 min-h-full bg-slate-100">
      
      {/* Header */}
      <header className="bg-slate-900 text-white pt-6 pb-12 px-6 rounded-b-[40px] shadow-2xl shadow-slate-900/20 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                  <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Feed</h2>
                  <h1 className="text-2xl font-black tracking-tight truncate max-w-[200px]">{user.fullName.split(' ')[0]}</h1>
              </div>
              <div onClick={() => onNavigate('profile')} className="bg-white/10 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-xs font-bold text-white">{user.stats.ratingAvg?.toFixed(1) || "N/A"} OVR</span>
              </div>
          </div>

          {/* Matches Carousel */}
          <div>
              <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Matches</span>
              </div>
              
              {matches.length === 0 ? (
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                      <Calendar size={24} className="mx-auto text-slate-500 mb-2 opacity-50" />
                      <p className="text-xs font-bold text-slate-400">No matches scheduled.</p>
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
                                       <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500 text-xs">V</div>
                                       <span className="text-[10px] font-bold text-slate-400 mt-1">Verum</span>
                                   </div>
                                   <div className="text-lg font-black text-slate-600">VS</div>
                                   <div className="flex flex-col items-center">
                                       <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-xs">{match.opponent[0]}</div>
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

      {/* Feed List */}
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
                <p className="text-slate-500 text-sm mt-1">No posts yet.</p>
                <button onClick={() => onNavigate('upload')} className="mt-4 bg-slate-900 text-white font-bold py-2 px-6 rounded-xl text-sm shadow-lg shadow-slate-900/20">
                    Create Post
                </button>
            </div>
        ) : (
            feedItems.map((item) => (
                <FeedCard key={item.id} item={item} user={user} onLike={handleLike} onComment={setActiveCommentId} />
            ))
        )}
      </div>

      {/* Comment Drawer */}
      <AnimatePresence>
        {activeCommentId && (
            <CommentsSheet mediaId={activeCommentId} user={user} onClose={() => setActiveCommentId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
