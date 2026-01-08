import React, { useState, useRef } from 'react';
import { Grid, Trophy, Share2, BadgeCheck, Activity, Copy, Check, Edit2, Save, X, Plus, Camera, Upload } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'awards'>('highlights');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local edit state
  const [editForm, setEditForm] = useState(user);

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: `Profile: ${user.fullName}`,
            text: `Check out ${user.fullName}'s athlete profile on Verum Academy.`,
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
    } catch (e) {
        console.error("Error updating profile", e);
        alert("Failed to save profile.");
    } finally {
        setIsSaving(false);
    }
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
              // Warning: Storing Base64 in Firestore isn't scalable for large apps, 
              // but fits the "functional database" request without Storage setup overhead.
              setEditForm(prev => ({ ...prev, avatarUrl: base64String }));
          };
          reader.readAsDataURL(file);
      }
  };

  const hasPhysicalData = user.physical.height !== '-' && user.physical.weight !== '-';
  const hasAvatar = !!editForm.avatarUrl;

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
                        // Reset form if cancelling, or just toggle
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
                                    <UserIconPlaceholder />
                                </div>
                             )}
                             
                             {/* Edit Overlay */}
                             {isEditing && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[20px] backdrop-blur-[2px]">
                                     <Camera size={24} className="text-white" />
                                 </div>
                             )}
                         </div>

                         {/* Verified Badge (only if not editing) */}
                         {!isEditing && hasAvatar && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                                <BadgeCheck size={16} fill="currentColor" className="text-white" />
                            </div>
                         )}
                     </div>
                     {isEditing && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Tap to change photo</p>}
                  </div>
                  
                  <div className="text-center mb-6 w-full">
                      {isEditing ? (
                        <div className="space-y-5 w-full px-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Full Name</label>
                                <input 
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-900 text-lg text-center shadow-sm"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Position</label>
                                    <input 
                                        value={editForm.position}
                                        onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-slate-900 text-center shadow-sm"
                                        placeholder="e.g. Striker"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase text-left mb-1.5 ml-1">Club</label>
                                    <input 
                                        value={editForm.club}
                                        onChange={(e) => setEditForm({...editForm, club: e.target.value})}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-slate-900 text-center shadow-sm"
                                        placeholder="Current Team"
                                    />
                                </div>
                            </div>
                        </div>
                      ) : (
                        <>
                            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                                {user.fullName || "New Athlete"}
                                {hasAvatar && <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">#10</span>}
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

                  {/* Physical Stats - Pill Style */}
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-2 border border-slate-100 mb-2 shadow-sm">
                      {[
                        { label: 'Age', key: 'age', val: user.physical.age },
                        { label: 'Height', key: 'height', val: user.physical.height },
                        { label: 'Weight', key: 'weight', val: user.physical.weight },
                        { label: 'Foot', key: 'foot', val: user.physical.foot },
                      ].map((stat, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center py-2 relative not-last:border-r not-last:border-slate-200">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                              {isEditing ? (
                                  <input 
                                    value={editForm.physical[stat.key as keyof typeof editForm.physical]}
                                    onChange={(e) => setEditForm({
                                        ...editForm, 
                                        physical: { ...editForm.physical, [stat.key]: e.target.value }
                                    })}
                                    className="w-full text-center text-sm font-bold bg-white border border-slate-200 rounded-lg p-1.5 focus:border-blue-500 focus:bg-white outline-none transition-colors mx-1"
                                    placeholder="-"
                                  />
                              ) : (
                                  <div className={`font-bold text-sm ${stat.val === '-' ? 'text-slate-300' : 'text-slate-900'}`}>{stat.val}</div>
                              )}
                              {i < 3 && !isEditing && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200"></div>}
                          </div>
                      ))}
                  </div>

                  {isEditing && (
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                          {isSaving ? (
                              <span>Saving...</span>
                          ) : (
                              <>
                                  <Save size={20} />
                                  <span>Save Changes</span>
                              </>
                          )}
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* Empty State Warning */}
      {!hasPhysicalData && !isEditing && (
          <div className="px-6 mt-4">
              <div 
                onClick={() => setIsEditing(true)}
                className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center space-x-4 cursor-pointer hover:bg-orange-100 transition-colors"
              >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                      <Edit2 size={20} />
                  </div>
                  <div className="flex-1">
                      <h4 className="text-orange-900 font-bold text-sm">Complete your profile</h4>
                      <p className="text-orange-700 text-xs">Add your physical stats to get scouted.</p>
                  </div>
              </div>
          </div>
      )}

      {/* Season Stats - Cards */}
      <div className="px-6 mb-8 mt-6">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
              <Activity size={16} className="mr-2 text-blue-500" /> Season Stats
          </h3>
          <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                  <span className="text-3xl font-black mb-1">{user.stats.matches}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">Matches</span>
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                  <span className="text-3xl font-black mb-1">{user.stats.goals}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">Goals</span>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/20 flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                  <span className="text-3xl font-black mb-1">{user.stats.assists}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">Assists</span>
              </div>
          </div>
      </div>

      {/* Toggle View */}
      <div className="bg-white border-t border-slate-100 min-h-[300px]">
          <div className="flex border-b border-slate-100 px-6">
             <button 
                onClick={() => setActiveTab('highlights')}
                className={`py-5 text-sm font-bold flex items-center space-x-2 mr-6 transition-colors border-b-2 ${activeTab === 'highlights' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
             >
                 <Grid size={18} />
                 <span>Highlights</span>
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
                      {/* Empty state for highlights if new user */}
                      {user.stats.matches === 0 ? (
                           <div className="col-span-2 py-8 flex flex-col items-center text-slate-400">
                               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                   <Upload size={20} />
                               </div>
                               <p className="text-xs font-bold">No highlights yet.</p>
                               <p className="text-[10px]">Go to Upload tab to add media.</p>
                           </div>
                      ) : (
                        [1,2,3,4].map((i) => (
                            <div key={i} className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
                                <img src={`https://picsum.photos/seed/soccer_h${i}/300/200`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        ))
                      )}
                  </div>
              ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                       {user.stats.matches === 0 ? (
                           <div className="py-8 flex flex-col items-center text-slate-400">
                               <Trophy size={32} className="mb-2 opacity-20" />
                               <p className="text-xs font-bold">No awards listed.</p>
                           </div>
                       ) : (
                          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                  <Trophy size={24} fill="currentColor" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-900">State Cup Champion</h4>
                                  <p className="text-xs text-slate-500">2023 • U-17 Division</p>
                              </div>
                          </div>
                       )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

// Simple Icon Component for cleaner JSX
const UserIconPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);