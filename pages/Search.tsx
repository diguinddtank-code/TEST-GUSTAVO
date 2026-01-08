import React, { useState } from 'react';
import { Filter, Play, Image as ImageIcon, CheckCircle, Clock, Star } from 'lucide-react';
import { MediaItem } from '../types';

interface SearchProps {
  mediaItems: MediaItem[];
}

export const Search: React.FC<SearchProps> = ({ mediaItems }) => {
  const [filter, setFilter] = useState('All');

  const filteredMedia = mediaItems.filter(item => 
      filter === 'All' ? true : item.category === filter
  );

  return (
    <div className="pb-32 pt-6 px-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Media</h1>
          <button className="w-10 h-10 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
             <Filter size={20} />
          </button>
      </div>

      {/* iOS Style Segmented Control */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl flex space-x-1 mb-8 overflow-x-auto no-scrollbar">
          {['All', 'Match', 'Training', 'Physical'].map(tab => (
              <button 
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm ${
                    filter === tab 
                    ? 'bg-white text-slate-900 shadow-md scale-100' 
                    : 'bg-transparent text-slate-500 hover:text-slate-700 shadow-none'
                }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {/* Modern Grid */}
      {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <ImageIcon size={48} className="text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-400">No media found.</p>
          </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
            {filteredMedia.map(item => (
                <div key={item.id} className="group relative break-inside-avoid">
                    <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden relative shadow-lg shadow-slate-200/50 border border-white/50 bg-slate-900">
                        {item.type === 'video' ? (
                            <video src={item.thumbnailUrl} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" muted playsInline />
                        ) : (
                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-80"></div>

                        {/* Video Indicator */}
                        {item.type === 'video' && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                <Play size={20} className="fill-white text-white ml-1" />
                            </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                            {item.status === 'featured' && (
                                <div className="bg-yellow-400/90 backdrop-blur-sm text-yellow-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg shadow-yellow-500/20 animate-pulse flex items-center space-x-1">
                                    <Star size={10} fill="currentColor" />
                                    <span>STAR</span>
                                </div>
                            )}
                            {item.status === 'pending' && (
                                <div className="bg-slate-900/80 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg border border-white/10">
                                    <Clock size={12} />
                                </div>
                            )}
                            {item.status === 'approved' && (
                                <div className="bg-emerald-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-lg border border-emerald-400/50 hover:scale-110 transition-transform">
                                    <CheckCircle size={12} />
                                </div>
                            )}
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex justify-between items-end">
                                <div className="flex-1 mr-2">
                                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-0.5">{item.category}</div>
                                    <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">{item.title}</h4>
                                </div>
                                {item.duration && (
                                    <div className="text-[10px] font-mono font-medium text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        {item.duration}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};