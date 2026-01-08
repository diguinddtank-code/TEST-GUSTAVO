import React, { useState, useRef, useEffect } from 'react';
import { Grid, Trophy, Share2, BadgeCheck, Activity, Edit2, Save, X, Plus, Camera, Upload, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { UserProfile, MediaItem, Award } from '../types';
import { db } from '../firebaseConfig';
import { doc, updateDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileProps {
  user: UserProfile;
  mediaItems?: MediaItem[];
  onUpdateUser: (u: UserProfile) => void;
  isAdmin?: boolean;
}

// Predefined Options
const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', '-'];
const FEET = ['Right', 'Left', 'Both', '-'];

export const Profile: React.FC<ProfileProps> = ({ user, mediaItems = [], onUpdateUser, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'awards'>('highlights');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Awards Logic
  const [awards, setAwards] = useState<Award[]>([]);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [newAward, setNewAward] = useState<Partial<Award>>({ title: '', date: '', issuer: '', icon: 'trophy' });

  // Local edit state
  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for missing data (Onboarding Logic)
    if (!isAdmin && (user.position === '-' || user.physical.height === '-' || user.physical.weight === '-')) {
        setShowOnboarding(true);
        setIsEditing(true); // Force edit mode logic inside modal
    }

    // Fetch Awards
    const q = query(collection(db, "awards"), where("userId", "==", user.id));
    const unsub = onSnapshot(q, (snap) => {
        const fetched: Award[] = [];
        snap.forEach(d => fetched.push({ ...d.data(), id: d.id } as Award));
        setAwards(fetched);
    });
    return () => unsub();
  }, [user.id]);

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: `Profile: ${user.fullName}`,
            text: `Check out ${user.fullName}'s profile on Verum Academy.`,
            url: window.location.href,
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, {
            fullName: editForm.fullName,
            position: editForm.position,
            club: editForm.club,
            avatarUrl: editForm.avatarUrl,
            physical: editForm.physical
        });
        
        onUpdateUser(editForm);
        setIsEditing(false);
        setShowOnboarding(false);
    } catch (e) {
        console.error("Error updating profile", e);
        alert("Failed to save profile.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddAward = async () => {
      if(!newAward.title || !newAward.date) return;
      await addDoc(collection(db, "awards"), { ...newAward, userId: user.id });
      setShowAwardModal(false);
      setNewAward({ title: '', date: '', issuer: '', icon: 'trophy' });
  };

  const handleImageClick = () => {
      if (isEditing && fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              setEditForm(prev => ({ ...prev, avatarUrl: base64String }));
          };
          reader.readAsDataURL(file);
      }
  };

  const hasAvatar = !!editForm.avatarUrl;
  
  // Filter for highlights (If Admin, show all. If Athlete, show Approved/Featured)
  const highlights = isAdmin 
      ? mediaItems 
      : mediaItems.filter(m => m.status === 'approved' || m.status === 'featured');

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-slate-50 min-h-full">
      
      {/* Immersive Header */}
      <div className="relative">
          <div className="h-64 w-full relative overflow-hidden">
             <div className="absolute inset-0 bg-slate-900"></div>
             {/* Gradient Mesh Background */}
             <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] opacity-40 translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500 rounded-full blur-[80px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
             
             <div className="absolute top-6 right-6 z-10 flex space-x-2">
                  <button 
                    onClick={() => {
                        if(isEditing) setEditForm(user); 
                        setIsEditing(!isEditing);
                    }}
                    className={`backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10 active:scale-95 ${isEditing ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-white/10'}`}
                  >
                      {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                  </button>
                  {!isEditing && (
                    <button 
                        onClick={handleShare}
                        className="bg-white/10 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10 active:scale-95"
                    >
                        {copied ? <Check size={20} /> : <Share2 size={20} />}
                    </button>
                  )}
             </div>
          </div>

          <div className="px-6 relative z-10 -mt-20">
              <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center -mt-16 mb-4">
                     <div className="relative group">
                         {/* Hidden File Input */}
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                         />
                         
                         <div 
                            onClick={handleImageClick}
                            className={`w-28 h-28 rounded-3xl p-1 bg-white shadow-xl rotate-3 relative overflow-hidden transition-transform ${isEditing ? 'cursor-pointer hover:scale-105 hover:rotate-0' : ''}`}
                         >
                             {hasAvatar ? (
                                <img src={editForm.avatarUrl} alt={editForm.fullName} className="w-full h-full object-cover rounded-[20px]" />
                             ) : (
                                <div className="w-full h-full bg-slate-100 rounded-[20px] flex items-center justify-center border-2 border-dashed border-slate-300">
                                    <Camera size={24} className="text-slate-400" />
                                </div>
                             )}
                             
                             {/* Edit Overlay */}
                             {isEditing && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[20px] backdrop-blur-[2px]">
                                     <Camera size={24} className="text-white" />
                                 </div>
                             )}
                         </div>
                     </div>
                     {isEditing && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Tap to change photo</p>}
                  </div>
                  
                  <div className="text-center mb-6 w-full">
                      {isEditing ? (
                        <div className="space-y-4 w-full px-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Full Name</label>
                                <input 
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-900 text-lg text-center"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Position</label>
                                    <select 
                                        value={editForm.position}
                                        onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-900 text-center appearance-none"
                                    >
                                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Club</label>
                                    <input 
                                        value={editForm.club}
                                        onChange={(e) => setEditForm({...editForm, club: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-900 text-center"
                                    />
                                </div>
                            </div>
                        </div>
                      ) : (
                        <>
                            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                                {user.fullName || "New Athlete"}
                            </h1>
                            <div className="flex items-center justify-center text-sm font-medium text-slate-500 mt-1">
                                <span className={user.position !== '-' ? "text-blue-600" : "text-slate-300"}>{user.position !== '-' ? user.position : "No Position"}</span>
                                <span className="mx-2 text-slate-300">•</span>
                                <span className={user.club !== '-' ? "text-slate-700" : "text-slate-300"}>
                                    {user.club !== '-' ? user.club : "No Club"}
                                </span>
                            </div>
                        </>
                      )}
                  </div>

                  {/* Physical Stats - Controlled Inputs */}
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-2 border border-slate-100 mb-2 shadow-sm">
                      {/* Age */}
                      <div className="flex-1 flex flex-col items-center py-2 relative border-r border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Age</div>
                          {isEditing ? (
                              <input 
                                type="number"
                                value={editForm.physical.age}
                                onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, age: e.target.value}})}
                                className="w-12 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg p-1"
                              />
                          ) : <div className="font-bold text-sm text-slate-900">{user.physical.age}</div>}
                      </div>
                      
                      {/* Height */}
                      <div className="flex-1 flex flex-col items-center py-2 relative border-r border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Height</div>
                          {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    placeholder="180"
                                    value={editForm.physical.height}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, height: e.target.value}})}
                                    className="w-12 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg p-1"
                                />
                                <span className="text-[10px] font-bold text-slate-400">cm</span>
                              </div>
                          ) : <div className="font-bold text-sm text-slate-900">{user.physical.height}cm</div>}
                      </div>

                      {/* Weight */}
                      <div className="flex-1 flex flex-col items-center py-2 relative border-r border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Weight</div>
                          {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input 
                                    type="number"
                                    placeholder="75"
                                    value={editForm.physical.weight}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, weight: e.target.value}})}
                                    className="w-12 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg p-1"
                                />
                                <span className="text-[10px] font-bold text-slate-400">kg</span>
                              </div>
                          ) : <div className="font-bold text-sm text-slate-900">{user.physical.weight}kg</div>}
                      </div>

                       {/* Foot */}
                       <div className="flex-1 flex flex-col items-center py-2 relative">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Foot</div>
                          {isEditing ? (
                               <select
                                value={editForm.physical.foot}
                                onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, foot: e.target.value as any}})}
                                className="w-16 text-center text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1 appearance-none"
                               >
                                   {FEET.map(f => <option key={f} value={f}>{f}</option>)}
                               </select>
                          ) : <div className="font-bold text-sm text-slate-900">{user.physical.foot}</div>}
                      </div>
                  </div>

                  {isEditing && !showOnboarding && (
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                          {isSaving ? <span>Saving...</span> : <> <Save size={20} /> <span>Save Changes</span> </>}
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* Tabs & Content (Highlights/Awards) */}
      <div className="bg-white border-t border-slate-100 min-h-[300px]">
          <div className="flex border-b border-slate-100 px-6">
             <button 
                onClick={() => setActiveTab('highlights')}
                className={`py-5 text-sm font-bold flex items-center space-x-2 mr-6 transition-colors border-b-2 ${activeTab === 'highlights' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
             >
                 <Grid size={18} />
                 <span>Media</span>
                 <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded ml-1">{highlights.length}</span>
             </button>
             <button 
                onClick={() => setActiveTab('awards')}
                className={`py-5 text-sm font-bold flex items-center space-x-2 transition-colors border-b-2 ${activeTab === 'awards' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
             >
                 <Trophy size={18} />
                 <span>Awards</span>
             </button>
          </div>

          <div className="p-6">
              {activeTab === 'highlights' ? (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                      {highlights.length === 0 ? (
                           <div className="col-span-2 py-8 flex flex-col items-center text-slate-400">
                               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                   <Upload size={20} />
                               </div>
                               <p className="text-xs font-bold">No media found.</p>
                           </div>
                      ) : (
                        highlights.map((item) => (
                            <div key={item.id} className="aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
                                <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-90" />
                                {isAdmin && (
                                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-white ${item.status === 'approved' ? 'bg-emerald-500' : item.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}>
                                        {item.status}
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">{item.category}</div>
                            </div>
                        ))
                      )}
                  </div>
              ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                       <button 
                          onClick={() => setShowAwardModal(true)}
                          className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-center text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                       >
                           <Plus size={16} className="mr-1" /> Add Award
                       </button>

                       {awards.map(award => (
                            <div key={award.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Trophy size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{award.title}</h4>
                                    <p className="text-xs text-slate-500">{award.date} • {award.issuer}</p>
                                </div>
                            </div>
                       ))}
                  </div>
              )}
          </div>
      </div>

      {/* ONBOARDING MODAL */}
      <AnimatePresence>
        {showOnboarding && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative"
                >
                    <div className="bg-blue-600 p-6 text-white text-center">
                        <Activity size={48} className="mx-auto mb-2 opacity-80" />
                        <h2 className="text-2xl font-black">Player Setup</h2>
                        <p className="text-blue-100 text-sm font-medium">Complete your athlete card to start.</p>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Reusing the controlled inputs from the main profile, but strictly focused */}
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                             <select 
                                value={editForm.position}
                                onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                                className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                             >
                                 {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                             </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Height (cm)</label>
                                <input type="number" placeholder="180" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                                    value={editForm.physical.height}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, height: e.target.value}})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Weight (kg)</label>
                                <input type="number" placeholder="75" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                                    value={editForm.physical.weight}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, weight: e.target.value}})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                                <input type="number" placeholder="18" className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                                    value={editForm.physical.age}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, age: e.target.value}})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Foot</label>
                                <select 
                                    value={editForm.physical.foot}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, foot: e.target.value as any}})}
                                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                                >
                                    {FEET.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <button 
                            onClick={handleSave}
                            disabled={editForm.position === '-' || editForm.physical.height === '-'}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                        >
                            Complete Profile
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};
