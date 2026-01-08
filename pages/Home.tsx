import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, TrendingUp } from 'lucide-react';
import { UserProfile, MediaItem } from '../types';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface HomeProps {
    user: UserProfile;
    mediaItems: MediaItem[]; // We might ignore this prop and fetch global feed instead
    onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const [feedItems, setFeedItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Global Feed (Approved or Featured items from everyone)
    // In a real app, this would query "Where authorId is in user.following"
    // For this MVP, we show ALL posts to make the network feel alive.
    const q = query(
        collection(db, "media"), 
        orderBy("date", "desc"),
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: MediaItem[] = [];
        snapshot.forEach(doc => items.push({ ...doc.data(), id: doc.id } as MediaItem));
        setFeedItems(items);
        setLoading(false);
    });

    return () => unsubscribe();
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
      } catch (e) {
          console.error("Error liking post", e);
      }
  };

  const getRelativeTime = (dateString: string) => {
      // Simplified relative time
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if(diff === 0) return "Today";
      if(diff === 1) return "Yesterday";
      return `${diff}d ago`;
  };

  return (
    <div className="pb-32 pt-2 min-h-full bg-slate-50">
      
      {/* Mini Stats / Stories Header */}
      <div className="px-6 mb-6 pt-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Discover</h1>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <TrendingUp size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Top Rated</span>
            </div>
        </div>
        
        {/* Horizontal Scroll "Stories" style for featured athletes could go here */}
        {/* For now, just a performance widget */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl shadow-slate-900/20 relative overflow-hidden flex items-center justify-between">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-30"></div>
             <div>
                 <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Your Index</div>
                 <div className="text-3xl font-black">{user.stats.ratingAvg?.toFixed(1) || "N/A"}</div>
             </div>
             <button onClick={() => onNavigate('profile')} className="z-10 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">
                 View Stats
             </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col space-y-6">
        {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : feedItems.length === 0 ? (
            <div className="text-center py-20 px-6 text-slate-400">
                <p>No posts yet. Be the first to post!</p>
            </div>
        ) : (
            feedItems.map((item) => {
                const isLiked = item.likes?.includes(user.id);
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={item.id} 
                        className="bg-white border-y border-slate-100 sm:border sm:rounded-3xl sm:mx-4 shadow-sm pb-4"
                    >
                        {/* Header */}
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100 overflow-hidden">
                                    {item.authorAvatar ? (
                                        <img src={item.authorAvatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-bold">
                                            {item.authorName?.[0] || "?"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 leading-none">{item.authorName || "Verum Athlete"}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">{getRelativeTime(item.date)} • {item.category}</p>
                                </div>
                            </div>
                            <button className="text-slate-300">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        {/* Media Content */}
                        <div className="w-full aspect-[4/5] sm:aspect-video bg-black relative">
                            {item.type === 'video' ? (
                                <div className="relative w-full h-full group">
                                     <video 
                                        src={item.thumbnailUrl} 
                                        className="w-full h-full object-cover" 
                                        controls 
                                        controlsList="nodownload"
                                        poster={item.thumbnailUrl} // Ideally a real poster
                                     />
                                     {/* Play icon overlay if needed, handled by native controls mostly */}
                                </div>
                            ) : (
                                <img src={item.thumbnailUrl} className="w-full h-full object-cover" />
                            )}
                            
                            {/* Tags / Badges */}
                            {item.status === 'featured' && (
                                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                                    Featured
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 flex justify-between items-center">
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => handleLike(item.id, item.likes)}
                                    className="flex items-center space-x-1 group"
                                >
                                    <Heart 
                                        size={24} 
                                        className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-800 group-hover:text-slate-500'}`} 
                                    />
                                    {(item.likes?.length || 0) > 0 && (
                                        <span className="text-sm font-bold text-slate-900">{item.likes?.length}</span>
                                    )}
                                </button>
                                <button className="text-slate-800 hover:text-slate-500 transition-colors">
                                    <MessageCircle size={24} />
                                </button>
                                <button className="text-slate-800 hover:text-slate-500 transition-colors">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="px-4">
                             <p className="text-sm text-slate-900">
                                 <span className="font-bold mr-2">{item.authorName || "Athlete"}</span>
                                 {item.title}
                             </p>
                             {item.coachRating && (
                                 <div className="mt-2 flex items-center space-x-2 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                                     <span className="text-[10px] font-bold text-blue-500 uppercase">Coach Rating</span>
                                     <span className="text-xs font-black text-blue-700">{item.coachRating}/10</span>
                                 </div>
                             )}
                        </div>
                    </motion.div>
                );
            })
        )}
      </div>
    </div>
  );
};
