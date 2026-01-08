
import React, { useState, useRef, useEffect } from 'react';
import { Grid, Trophy, Share2, BadgeCheck, Activity, Edit2, Save, X, Plus, Camera, Upload, Check, Ruler, Weight, User as UserIcon, Footprints } from 'lucide-react';
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
        setIsEditing(true); 
    }

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
            physical: editForm.physical,
            bio: editForm.bio
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
  
  const highlights = isAdmin 
      ? mediaItems 
      : mediaItems.filter(m => m.status === 'approved' || m.status === 'featured');

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-slate-50 min-h-full">
      
      {/* Immersive Header */}
      <div className="relative">
          <div className="h-72 w-full relative overflow-hidden bg-slate-900">
             {/* Gradient Background */}
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-30 translate-x-1/3 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[100px] opacity-20 -translate-x-1/3 translate-y-1/2"></div>
             
             {/* Action Buttons */}
             <div className="absolute top-6 right-6 z-20 flex space-x-2">
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

          <div className="px-5 relative z-10 -mt-28">
              <div className="bg-white/90 backdrop-blur-sm rounded-[32px] p-6 shadow-2xl shadow-slate-900/10 border border-white">
                  
                  {/* Player Identity Section */}
                  <div className="flex flex-col items-center mb-6">
                     <div className="relative group -mt-16 mb-4">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                         <div 
                            onClick={handleImageClick}
                            className={`w-32 h-32 rounded-[28px] p-1.5 bg-white shadow-xl relative overflow-hidden transition-all ${isEditing ? 'cursor-pointer hover:scale-105' : ''}`}
                         >
                             {hasAvatar ? (
                                <img src={editForm.avatarUrl} alt={editForm.fullName} className="w-full h-full object-cover rounded-[22px]" />
                             ) : (
                                <div className="w-full h-full bg-slate-100 rounded-[22px] flex items-center justify-center border-2 border-dashed border-slate-300">
                                    <Camera size={32} className="text-slate-400" />
                                </div>
                             )}
                             {isEditing && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[22px] backdrop-blur-[2px]">
                                     <Camera size={24} className="text-white" />
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     {isEditing ? (
                         <div className="w-full space-y-3">
                            <input 
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                className="w-full text-center text-xl font-black text-slate-900 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                                placeholder="Full Name"
                            />
                            <div className="flex gap-2">
                                <select 
                                    value={editForm.position}
                                    onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                                    className="flex-1 bg-slate-50 p-2 rounded-lg font-bold text-sm text-center"
                                >
                                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <input 
                                    value={editForm.club}
                                    onChange={(e) => setEditForm({...editForm, club: e.target.value})}
                                    className="flex-1 bg-slate-50 p-2 rounded-lg font-bold text-sm text-center"
                                    placeholder="Club Name"
                                />
                            </div>
                         </div>
                     ) : (
                         <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{user.fullName || "New Athlete"}</h1>
                            <div className="flex items-center justify-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{user.position}</span>
                                <span className="text-slate-400 text-xs font-bold">•</span>
                                <span className="text-slate-600 font-bold text-sm">{user.club}</span>
                            </div>
                         </div>
                     )}
                  </div>

                  {/* Season Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Season</span>
                          <span className="text-xl font-black text-slate-900">24/25</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Matches</span>
                          <span className="text-xl font-black text-slate-900">{user.stats.matches}</span>
                      </div>
                      <div className="bg-emerald-50 rounded-2xl p-3 flex flex-col items-center border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Rating</span>
                          <span className="text-xl font-black text-emerald-700">{user.stats.ratingAvg?.toFixed(1) || "-"}</span>
                      </div>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                          <Ruler size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                              {isEditing ? <input type="number" className="w-8 text-center bg-slate-50" value={editForm.physical.height} onChange={e => setEditForm({...editForm, physical:{...editForm.physical, height: e.target.value}})} /> : user.physical.height} cm
                          </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                          <Weight size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                              {isEditing ? <input type="number" className="w-8 text-center bg-slate-50" value={editForm.physical.weight} onChange={e => setEditForm({...editForm, physical:{...editForm.physical, weight: e.target.value}})} /> : user.physical.weight} kg
                          </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                          <Footprints size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                              {isEditing ? (
                                  <select className="bg-slate-50 text-xs" value={editForm.physical.foot} onChange={e => setEditForm({...editForm, physical:{...editForm.physical, foot: e.target.value as any}})}>
                                      {FEET.map(f => <option key={f} value={f}>{f}</option>)}
                                  </select>
                              ) : user.physical.foot}
                          </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                          <UserIcon size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                             {isEditing ? <input type="number" className="w-8 text-center bg-slate-50" value={editForm.physical.age} onChange={e => setEditForm({...editForm, physical:{...editForm.physical, age: e.target.value}})} /> : user.physical.age} yo
                          </span>
                      </div>
                  </div>
                  
                  {/* Bio Section */}
                  <div className="mb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">About</div>
                      {isEditing ? (
                          <textarea 
                             className="w-full bg-slate-50 rounded-xl p-3 text-sm font-medium text-slate-700 min-h-[80px]"
                             placeholder="Write a short bio..."
                             value={editForm.bio}
                             onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          />
                      ) : (
                          <p className="text-sm text-slate-600 text-center leading-relaxed italic">
                              "{user.bio || 'No bio yet. Tap edit to add one.'}"
                          </p>
                      )}
                  </div>

                  {isEditing && !showOnboarding && (
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform flex items-center justify-center space-x-2"
                      >
                          {isSaving ? <span>Saving...</span> : <> <Save size={18} /> <span>Save Profile</span> </>}
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-t border-slate-100 min-h-[300px]">
          <div className="flex justify-center border-b border-slate-100">
             <div className="flex space-x-8">
                 <button 
                    onClick={() => setActiveTab('highlights')}
                    className={`py-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'highlights' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
                 >
                     <Grid size={18} />
                     <span>Media</span>
                 </button>
                 <button 
                    onClick={() => setActiveTab('awards')}
                    className={`py-4 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'awards' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'}`}
                 >
                     <Trophy size={18} />
                     <span>Awards</span>
                 </button>
             </div>
          </div>

          <div className="p-4">
              {activeTab === 'highlights' ? (
                  <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                      {highlights.length === 0 ? (
                           <div className="col-span-3 py-12 flex flex-col items-center text-slate-300">
                               <Upload size={32} className="mb-2 opacity-50" />
                               <p className="text-xs font-bold">No highlights yet.</p>
                           </div>
                      ) : (
                        highlights.map((item) => (
                            <div key={item.id} className="aspect-square bg-slate-900 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
                                <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-90" />
                                {isAdmin && (
                                    <div className={`absolute top-1 left-1 w-2 h-2 rounded-full ${item.status === 'approved' ? 'bg-emerald-500' : item.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                )}
                            </div>
                        ))
                      )}
                  </div>
              ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
                       <button 
                          onClick={() => setShowAwardModal(true)}
                          className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-center text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                       >
                           <Plus size={16} className="mr-1" /> Add Award
                       </button>
                       {awards.map(award => (
                            <div key={award.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Trophy size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{award.title}</h4>
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
