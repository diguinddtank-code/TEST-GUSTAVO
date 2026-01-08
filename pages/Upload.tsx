import React, { useState, useRef } from 'react';
import { Video, Image as ImageIcon, Check, ChevronRight, UploadCloud, X, Loader2, ArrowRight, Trash2, Play } from 'lucide-react';
import { MediaItem } from '../types';

interface UploadProps {
  onNavigate: (tab: string) => void;
  onAddMedia: (item: MediaItem) => void;
}

export const Upload: React.FC<UploadProps> = ({ onNavigate, onAddMedia }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'video' | 'photo' | null>(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  
  // File State
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeSelect = (type: 'video' | 'photo') => {
      setSelectedType(type);
      setStep(2);
  };

  const triggerFileSelect = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setFileName(file.name);
          // Convert to Base64 for preview and storage
          const reader = new FileReader();
          reader.onloadend = () => {
              setFileUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFileUrl(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!title || !category || !fileUrl || !selectedType) return;
    
    setIsSubmitting(true);
    
    // Create Media Item
    const newItem: MediaItem = {
        id: Date.now().toString(),
        type: selectedType,
        title: title,
        category: category as any,
        date: 'Just now',
        status: 'pending', // Default status for new uploads
        thumbnailUrl: fileUrl, // Use the base64 string as source
        duration: selectedType === 'video' ? '00:00' : undefined 
    };

    // Simulate network delay then save
    setTimeout(() => {
        onAddMedia(newItem);
        setIsSubmitting(false);
        // Reset form is handled by the navigation change in parent, but good to clear
        handleReset();
    }, 1500);
  };

  const handleReset = () => {
      setStep(1);
      setCategory('');
      setTitle('');
      setFileUrl(null);
      setFileName('');
      setSelectedType(null);
  };

  return (
    <div className="pb-32 pt-6 px-6 animate-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">
      
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Media</h1>
          {step === 2 && (
              <button onClick={() => setStep(1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={16} />
              </button>
          )}
      </div>

      {step === 1 ? (
        <div className="flex-1 flex flex-col space-y-4">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-4">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Share your progress</h2>
                <p className="text-sm text-slate-500">Upload high quality clips for coach review.</p>
            </div>

            <button onClick={() => handleTypeSelect('video')} className="relative overflow-hidden bg-blue-600 text-white rounded-3xl p-6 text-left shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                    <Video size={100} fill="currentColor" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Video size={24} className="text-white" />
                        </div>
                        <h3 className="text-lg font-extrabold">Highlights</h3>
                        <p className="text-blue-100 text-xs mt-1 font-medium">Goals, Assists, Skills</p>
                    </div>
                    <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                </div>
            </button>

            <button onClick={() => handleTypeSelect('photo')} className="relative overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 text-left shadow-sm hover:border-slate-300 hover:scale-[1.02] transition-all group">
                 <div className="absolute top-0 right-0 p-8 text-slate-100 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                    <ImageIcon size={100} fill="currentColor" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                            <ImageIcon size={24} className="text-slate-600" />
                        </div>
                        <h3 className="text-lg font-extrabold">Photos</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Matchday, Team Events</p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
            </button>
        </div>
      ) : (
        <div className="space-y-6">
             {/* Hidden File Input */}
             <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={selectedType === 'video' ? "video/*" : "image/*"}
                className="hidden"
             />

             {/* File Preview Area */}
             <div 
                onClick={triggerFileSelect}
                className={`w-full h-56 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${
                    fileUrl ? 'bg-black border-none' : 'bg-slate-50 border-2 border-dashed border-slate-300 hover:bg-slate-100 hover:border-blue-400'
                }`}
             >
                 {fileUrl ? (
                     <>
                        {selectedType === 'video' ? (
                            <video src={fileUrl} className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <img src={fileUrl} className="w-full h-full object-cover opacity-80" />
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                <UploadCloud size={24} />
                            </div>
                        </div>

                        <button 
                            onClick={handleRemoveFile}
                            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                        >
                            <Trash2 size={16} />
                        </button>
                     </>
                 ) : (
                     <>
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {selectedType === 'video' ? <Video size={28} className="text-blue-500" /> : <ImageIcon size={28} className="text-blue-500" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tap to browse {selectedType}</span>
                     </>
                 )}
             </div>

             <div className="space-y-4">
                <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-semibold transition-all shadow-sm"
                        placeholder={selectedType === 'video' ? "e.g. Goal vs Santos" : "e.g. Team Celebration"}
                    />
                </div>

                <div>
                    <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Match', 'Training', 'Physical', 'Tactical'].map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all duration-200 ${
                                    category === cat 
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
             </div>

             <div className="pt-4">
                <button 
                    onClick={handleSubmit}
                    disabled={!title || !category || !fileUrl || isSubmitting}
                    className={`w-full font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
                        !title || !category || !fileUrl
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 text-white shadow-blue-600/30'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <span>Submit for Review</span>
                            <Check size={20} strokeWidth={3} />
                        </>
                    )}
                </button>
             </div>
        </div>
      )}

    </div>
  );
};