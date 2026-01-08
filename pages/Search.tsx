import React, { useState } from 'react';
import { Filter, Play, Image as ImageIcon, CheckCircle, Clock, Star, MessageCircle, X } from 'lucide-react';
import { MediaItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchProps {
  mediaItems: MediaItem[];
}

export const Search: React.FC<SearchProps> = ({ mediaItems }) => {
  const [filter, setFilter] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const filteredMedia = mediaItems.filter(item => 
      filter === 'All' ? true : item.category === filter
  );

  return (
    <div className="pb-32 pt-6 px-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gallery</h1>
          <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
              {filteredMedia.length} Items
          </div>
      </div>

      {/* iOS Style Segmented Control */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Match', 'Training', 'Physical'].map(tab => (
              <button 
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border ${
                    filter === tab 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* Masonry-ish Grid */}
      <div className="grid grid-cols-2 gap-4 pb-20">
            {filteredMedia.map((item, index) => (
                <motion.div 
                    layoutId={`media-${item.id}`}
                    key={item.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedMedia(item)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-md"
                >
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                         {item.status === 'approved' && <div className="bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={10} /></div>}
                         {item.status === 'pending' && <div className="bg-slate-500/50 backdrop-blur text-white p-1 rounded-full"><Clock size={10} /></div>}
                    </div>

                    {/* Gradient & Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">{item.category}</span>
                        <h4 className="text-white text-sm font-bold leading-tight line-clamp-2">{item.title}</h4>
                        
                        {/* Rating Indicator */}
                        {item.coachRating && (
                            <div className="flex items-center space-x-1 mt-2">
                                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-white">{item.coachRating}/10</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
      </div>

      {/* Media Detail Modal */}
      <AnimatePresence>
      {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMedia(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              
              <motion.div 
                layoutId={`media-${selectedMedia.id}`}
                className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden relative z-10 shadow-2xl"
              >
                  {/* Media Viewer */}
                  <div className="aspect-square bg-black relative">
                       {selectedMedia.type === 'video' ? (
                           <video src={selectedMedia.thumbnailUrl} className="w-full h-full object-cover" controls autoPlay loop />
                       ) : (
                           <img src={selectedMedia.thumbnailUrl} className="w-full h-full object-cover" />
                       )}
                       <button 
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
                       >
                           <X size={20} />
                       </button>
                  </div>

                  {/* Details & Feedback */}
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{selectedMedia.title}</h2>
                              <p className="text-slate-500 text-sm mt-1">{selectedMedia.category} • {selectedMedia.date}</p>
                          </div>
                          {selectedMedia.status === 'approved' ? (
                               <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                   Approved
                               </div>
                          ) : (
                               <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                                   Pending
                               </div>
                          )}
                      </div>

                      {/* Coach Feedback Section */}
                      {selectedMedia.coachFeedback ? (
                          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                              <div className="flex items-center space-x-2 mb-2">
                                  <MessageCircle size={16} className="text-blue-600" />
                                  <span className="text-xs font-bold text-blue-900 uppercase">Coach Feedback</span>
                              </div>
                              <p className="text-slate-700 text-sm font-medium leading-relaxed">"{selectedMedia.coachFeedback}"</p>
                              <div className="mt-3 flex items-center">
                                  <div className="flex">
                                    {[1,2,3,4,5].map(star => (
                                        <Star 
                                            key={star} 
                                            size={14} 
                                            className={`${(selectedMedia.coachRating || 0) / 2 >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                                        />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-xs font-bold text-slate-500">{selectedMedia.coachRating}/10</span>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                              <p className="text-xs font-bold">Waiting for coach review...</p>
                          </div>
                      )}
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>
    </div>
  );
};