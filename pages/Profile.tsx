
import React, { useState, useRef, useEffect } from 'react';
import { Grid, Trophy, Share2, Edit2, Save, X, Plus, Camera, Upload, Check, Ruler, Weight, User as UserIcon, Footprints, MapPin, Activity, Calendar, Play, MessageCircle, Star, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Share & Card Generation State
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Highlight Modal State
  const [selectedHighlight, setSelectedHighlight] = useState<MediaItem | null>(null);

  // Awards Logic
  const [awards, setAwards] = useState<Award[]>([]);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [newAward, setNewAward] = useState<Partial<Award>>({ title: '', date: '', issuer: '', icon: 'trophy' });

  // Local edit state
  const [editForm, setEditForm] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Average Rating from Media Items (Smart Stats)
  const calculateMediaRating = () => {
      const ratedItems = mediaItems.filter(m => m.coachRating && m.coachRating > 0);
      if (ratedItems.length === 0) return 0;
      const total = ratedItems.reduce((acc, curr) => acc + (curr.coachRating || 0), 0);
      return (total / ratedItems.length).toFixed(1);
  };

  const calculatedAvg = calculateMediaRating();

  useEffect(() => {
    if (!isAdmin && user.position === '-' && !isEditing) {
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

  // --- CANVAS GENERATOR FOR SHARE CARD ---
  const generateCard = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Setup Canvas High Res
      const width = 1080;
      const height = 1350; // Instagram Portrait Ratio (4:5)
      canvas.width = width;
      canvas.height = height;

      // 2. Draw Background (Dark Gradient)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a'); // Slate 900
      grad.addColorStop(1, '#1e293b'); // Slate 800
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add "Carbon Fibre" pattern overlay effect (simulated with lines)
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 2;
      for(let i=0; i<height; i+=20) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i - 200);
          ctx.stroke();
      }

      // 3. Draw Header Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFFICIAL SCOUTING CARD', width / 2, 80);
      
      ctx.fillStyle = '#3b82f6'; // Blue 500
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('VERUM ACADEMY', width / 2, 120);

      // 4. Draw Avatar (Circle)
      const centerX = width / 2;
      const centerY = 450;
      const radius = 220;

      // Glow effect behind avatar
      const glow = ctx.createRadialGradient(centerX, centerY, radius - 50, centerX, centerY, radius + 50);
      glow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 50, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Image
      const img = new Image();
      img.src = user.avatarUrl || 'https://via.placeholder.com/400'; // Fallback
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
          ctx.restore();

          // Border Ring
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 15;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Position Badge on Image
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(centerX - 80, centerY + radius - 40, 160, 60, 30);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(user.position, centerX, centerY + radius + 5);

          finishDrawing(ctx, width, height);
      };

      // Handle image load error or if image is already cached
      if (img.complete) {
          img.onload?.(new Event('load'));
      }
  };

  const finishDrawing = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // 5. Player Name & Club
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 80px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor="rgba(0,0,0,0.5)";
        ctx.shadowBlur=20;
        ctx.fillText(user.fullName.toUpperCase(), width / 2, 780);
        ctx.shadowBlur=0;

        ctx.fillStyle = '#94a3b8'; // Slate 400
        ctx.font = '500 40px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(user.club, width / 2, 840);

        // 6. Stats Grid (The "FIFA" Box)
        const boxY = 920;
        const boxWidth = 900;
        const boxHeight = 280;
        const boxX = (width - boxWidth) / 2;

        // Background Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 40);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stats Values
        const drawStat = (label: string, value: string | number, x: number, color: string = '#ffffff') => {
            ctx.fillStyle = color;
            ctx.font = '900 90px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(String(value), x, boxY + 140);
            
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(label, x, boxY + 200);
        };

        drawStat('MATCHES', user.stats.matches, boxX + 150);
        drawStat('GOALS + A', user.stats.goals + user.stats.assists, boxX + 450);
        drawStat('RATING', user.stats.ratingAvg?.toFixed(1) || '-', boxX + 750, '#10b981'); // Emerald color

        // 7. Footer
        ctx.fillStyle = '#334155';
        ctx.font = '30px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('verumacademy.com', width / 2, height - 60);

        // Convert to Image
        setGeneratedImage(canvasRef.current?.toDataURL('image/png') || null);
  };

  const openShareModal = () => {
      setShowShareModal(true);
      // Small delay to ensure canvas is in DOM if we weren't using a hidden one, 
      // but here we render canvas inside modal or hidden.
      setTimeout(generateCard, 100);
  };

  const handleDownloadImage = () => {
      if (generatedImage) {
          const link = document.createElement('a');
          link.href = generatedImage;
          link.download = `Verum_Card_${user.fullName}.png`;
          link.click();
      }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const userRef = doc(db, "users", user.id);
        
        // Deep merge stats
        const updatedStats = {
            ...user.stats,
            matches: Number(editForm.stats.matches),
            goals: Number(editForm.stats.goals),
            assists: Number(editForm.stats.assists),
            ratingAvg: Number(editForm.stats.ratingAvg)
        };

        const updatedUser = {
            ...user,
            fullName: editForm.fullName,
            position: editForm.position,
            club: editForm.club,
            avatarUrl: editForm.avatarUrl,
            physical: editForm.physical,
            bio: editForm.bio,
            stats: updatedStats
        };
        
        await updateDoc(userRef, {
            fullName: editForm.fullName,
            position: editForm.position,
            club: editForm.club,
            avatarUrl: editForm.avatarUrl,
            physical: editForm.physical,
            bio: editForm.bio,
            stats: updatedStats
        });
        
        onUpdateUser(updatedUser);
        setIsEditing(false);
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
    <div className="pb-32 bg-slate-50 min-h-full">
      
      {/* PROFESSIONAL PORTFOLIO HEADER */}
      <div className="relative bg-slate-900 pb-12 rounded-b-[40px] shadow-2xl overflow-hidden">
          {/* Background Design */}
          <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
             <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>

          <div className="relative z-10 px-6 pt-8">
             {/* Toolbar */}
             <div className="flex justify-between items-start mb-6">
                 <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Verum Academy</span>
                    <span className="text-white text-xs font-bold opacity-60">Official Athlete Portfolio</span>
                 </div>
                 <div className="flex space-x-2">
                      {!isAdmin && (
                        <button 
                            onClick={() => {
                                if(isEditing) setEditForm(user); // Reset on cancel
                                setIsEditing(!isEditing);
                            }}
                            className={`backdrop-blur-md p-2.5 rounded-full transition-all border active:scale-95 ${isEditing ? 'bg-red-500/20 text-red-100 border-red-500/30' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                        >
                            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                        </button>
                      )}
                      {!isEditing && (
                        <button 
                            onClick={openShareModal}
                            className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-500"
                        >
                            <Share2 size={18} />
                        </button>
                      )}
                 </div>
             </div>

             {/* Main Identity Card */}
             <div className="flex flex-col items-center">
                 {/* Avatar */}
                 <div className="relative mb-4 group">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                     <div 
                        onClick={handleImageClick}
                        className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-emerald-400 relative overflow-hidden shadow-2xl ${isEditing ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
                     >
                         <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden border-4 border-slate-900">
                             {hasAvatar ? (
                                <img src={editForm.avatarUrl} alt={editForm.fullName} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <Camera size={32} />
                                </div>
                             )}
                         </div>
                         {isEditing && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full backdrop-blur-[2px]">
                                 <Camera size={20} className="text-white" />
                             </div>
                         )}
                     </div>
                     {/* Position Badge */}
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg border border-slate-700 shadow-xl">
                        {isEditing ? (
                            <select 
                                value={editForm.position}
                                onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                                className="bg-transparent text-sm font-black outline-none text-center appearance-none"
                            >
                                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        ) : (
                            <span className="text-sm font-black tracking-wider">{user.position}</span>
                        )}
                     </div>
                 </div>

                 {/* Name & Club */}
                 <div className="text-center w-full max-w-xs">
                     {isEditing ? (
                         <div className="space-y-2">
                             <input 
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-center text-lg font-bold text-white placeholder:text-white/30 focus:border-blue-500 outline-none"
                                placeholder="Full Name"
                             />
                             <input 
                                value={editForm.club}
                                onChange={(e) => setEditForm({...editForm, club: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-center text-sm font-medium text-slate-300 placeholder:text-slate-500 focus:border-blue-500 outline-none"
                                placeholder="Current Club"
                             />
                         </div>
                     ) : (
                         <>
                            <h1 className="text-3xl font-black text-white leading-tight mb-1">{user.fullName || "Athlete Name"}</h1>
                            <div className="flex items-center justify-center text-slate-400 font-medium space-x-1.5">
                                <MapPin size={14} />
                                <span>{user.club}</span>
                            </div>
                         </>
                     )}
                 </div>
             </div>

             {/* Scout Data Row (Physicals) */}
             <div className="grid grid-cols-4 gap-2 mt-8">
                 {[
                     { label: 'HT (cm)', icon: Ruler, val: editForm.physical.height, key: 'height', suffix: '' },
                     { label: 'WT (kg)', icon: Weight, val: editForm.physical.weight, key: 'weight', suffix: '' },
                     { label: 'Age', icon: Calendar, val: editForm.physical.age, key: 'age', suffix: '' },
                     { label: 'Foot', icon: Footprints, val: editForm.physical.foot, key: 'foot', suffix: '' }
                 ].map((stat) => (
                     <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-center backdrop-blur-sm">
                         <div className="flex items-center space-x-1 text-slate-400 mb-1">
                            <stat.icon size={10} />
                            <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                         </div>
                         {isEditing ? (
                             stat.key === 'foot' ? (
                                <select 
                                    className="bg-transparent text-white font-bold text-xs w-full text-center outline-none"
                                    value={stat.val}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, foot: e.target.value as any}})}
                                >
                                    {FEET.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                             ) : (
                                <input 
                                    type="number"
                                    className="bg-transparent text-white font-bold text-sm w-full text-center outline-none border-b border-white/20 focus:border-blue-500"
                                    value={stat.val}
                                    onChange={(e) => setEditForm({...editForm, physical: {...editForm.physical, [stat.key]: e.target.value}})}
                                />
                             )
                         ) : (
                             <span className="text-white font-black text-sm">{stat.val}{stat.suffix}</span>
                         )}
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {/* Main Content Body */}
      <div className="px-5 -mt-6 relative z-20">
          
          {/* Season Stats Card */}
          <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 p-5 mb-6 border border-slate-100">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                       <Activity size={18} className="text-blue-600"/>
                       Season Stats
                   </h3>
                   {isEditing && (
                       <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">Self Reported</span>
                   )}
                   {!isEditing && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">24/25</span>}
               </div>
               <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100">
                    <div className="text-center">
                        {isEditing ? (
                            <input 
                                type="number" 
                                className="w-full text-center text-2xl font-black text-slate-900 border-b border-blue-200 outline-none"
                                value={editForm.stats.matches}
                                onChange={(e) => setEditForm({...editForm, stats: {...editForm.stats, matches: Number(e.target.value)}})}
                            />
                        ) : (
                            <div className="text-2xl font-black text-slate-900">{user.stats.matches}</div>
                        )}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Matches</div>
                    </div>
                    <div className="text-center">
                         {isEditing ? (
                            <div className="flex gap-1 justify-center">
                                <input 
                                    type="number" placeholder="G"
                                    className="w-12 text-center text-xl font-black text-slate-900 border-b border-blue-200 outline-none"
                                    value={editForm.stats.goals}
                                    onChange={(e) => setEditForm({...editForm, stats: {...editForm.stats, goals: Number(e.target.value)}})}
                                />
                                <input 
                                    type="number" placeholder="A"
                                    className="w-12 text-center text-xl font-black text-slate-900 border-b border-blue-200 outline-none"
                                    value={editForm.stats.assists}
                                    onChange={(e) => setEditForm({...editForm, stats: {...editForm.stats, assists: Number(e.target.value)}})}
                                />
                            </div>
                        ) : (
                            <div className="text-2xl font-black text-slate-900">{user.stats.goals + user.stats.assists}</div>
                        )}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">G + A</div>
                    </div>
                    <div className="text-center">
                        {isEditing ? (
                            <>
                                <input 
                                    type="number" step="0.1"
                                    className="w-full text-center text-2xl font-black text-emerald-500 border-b border-emerald-200 outline-none"
                                    value={editForm.stats.ratingAvg}
                                    onChange={(e) => setEditForm({...editForm, stats: {...editForm.stats, ratingAvg: Number(e.target.value)}})}
                                />
                                {Number(calculatedAvg) > 0 && (
                                    <div className="text-[9px] text-slate-400 mt-1">
                                        Vid Avg: <span className="text-emerald-600 font-bold">{calculatedAvg}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-2xl font-black text-emerald-500">{user.stats.ratingAvg?.toFixed(1) || "-"}</div>
                        )}
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Rating</div>
                    </div>
               </div>
          </div>

          {/* Bio Section */}
          <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">About Athlete</h3>
              {isEditing ? (
                  <textarea 
                     className="w-full bg-white rounded-2xl p-4 text-sm font-medium text-slate-700 min-h-[100px] border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Tell scouts about your playing style, achievements, and goals..."
                     value={editForm.bio}
                     onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  />
              ) : (
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      {user.bio || 'No bio available yet.'}
                  </p>
              )}
          </div>

          {isEditing && (
              <div className="fixed bottom-24 left-6 right-6 z-50">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-2xl shadow-slate-900/40 active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 border border-slate-700"
                  >
                      {isSaving ? <span>Saving...</span> : <> <Save size={20} /> <span>Save Changes</span> </>}
                  </button>
              </div>
          )}

          {/* Content Tabs */}
          <div>
              <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">
                 <button 
                    onClick={() => setActiveTab('highlights')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'highlights' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                     Highlights
                 </button>
                 <button 
                    onClick={() => setActiveTab('awards')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'awards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                     Awards & Certs
                 </button>
              </div>

              {activeTab === 'highlights' ? (
                  <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-300">
                      {highlights.length === 0 ? (
                           <div className="col-span-3 py-12 flex flex-col items-center text-slate-300 bg-white rounded-2xl border border-slate-100 border-dashed">
                               <Upload size={32} className="mb-2 opacity-50" />
                               <p className="text-xs font-bold">No highlights yet.</p>
                           </div>
                      ) : (
                        highlights.map((item) => (
                            <motion.div 
                                layoutId={item.id}
                                key={item.id} 
                                onClick={() => setSelectedHighlight(item)}
                                className="aspect-[4/5] bg-slate-900 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all"
                            >
                                {item.type === 'video' ? (
                                    <video 
                                        src={item.thumbnailUrl} 
                                        className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100"
                                        muted
                                        playsInline
                                        loop
                                        onMouseOver={e => e.currentTarget.play()}
                                        onMouseOut={e => e.currentTarget.pause()}
                                    />
                                ) : (
                                    <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                                )}
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-2">
                                     {item.type === 'video' ? <Play className="text-white" size={20} fill="white" /> : <Plus className="text-white" size={20} />}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-[9px] font-bold text-white truncate">{item.title}</p>
                                </div>
                            </motion.div>
                        ))
                      )}
                  </div>
              ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
                       {(isAdmin || isEditing) && (
                           <button 
                              onClick={() => setShowAwardModal(true)}
                              className="w-full border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-3 flex items-center justify-center text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                           >
                               <Plus size={16} className="mr-1" /> Add Achievement
                           </button>
                       )}
                       
                       {awards.length === 0 ? (
                           <div className="text-center py-8 text-slate-400 text-sm">No awards listed yet.</div>
                       ) : (
                           awards.map(award => (
                                <div key={award.id} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-100">
                                        <Trophy size={20} className="drop-shadow-sm" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{award.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{award.issuer} • {award.date}</p>
                                    </div>
                                </div>
                           ))
                       )}
                  </div>
              )}
          </div>
      </div>

      {/* Share Card Modal */}
      <AnimatePresence>
          {showShareModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-sm"
                  >
                      <div className="flex justify-between items-center mb-4 text-white">
                          <h2 className="text-lg font-bold">Share Profile Card</h2>
                          <button onClick={() => setShowShareModal(false)}><X size={24} /></button>
                      </div>

                      {/* Canvas Container (Hidden but used for generation logic) */}
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Display Image */}
                      <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 bg-slate-800">
                          {generatedImage ? (
                              <img src={generatedImage} alt="Profile Card" className="w-full h-auto" />
                          ) : (
                              <div className="w-full aspect-[4/5] flex items-center justify-center text-white font-bold">
                                  Generating...
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={handleDownloadImage}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
                      >
                          <Download size={20} />
                          <span>Download Image</span>
                      </button>
                      <p className="text-center text-white/50 text-xs mt-3">Save and share on Instagram/WhatsApp</p>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* Highlights Detail Modal */}
      <AnimatePresence>
        {selectedHighlight && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="absolute inset-0" onClick={() => setSelectedHighlight(null)} />
                
                <motion.div 
                    layoutId={selectedHighlight.id}
                    className="bg-white w-full max-w-lg rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Media Header */}
                    <div className="aspect-video bg-black relative flex-shrink-0">
                         {selectedHighlight.type === 'video' ? (
                             <video 
                                src={selectedHighlight.thumbnailUrl} 
                                className="w-full h-full object-contain" 
                                controls 
                                autoPlay 
                             />
                         ) : (
                             <img src={selectedHighlight.thumbnailUrl} className="w-full h-full object-contain" />
                         )}
                         <button 
                            onClick={() => setSelectedHighlight(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                             <X size={20} />
                         </button>
                    </div>

                    {/* Info Body */}
                    <div className="p-6 overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{selectedHighlight.title}</h2>
                                <p className="text-slate-500 text-xs font-bold mt-1 flex items-center">
                                    <Clock size={12} className="mr-1" /> {selectedHighlight.date.split('T')[0]} 
                                    <span className="mx-2">•</span> 
                                    <span className="text-blue-600 uppercase">{selectedHighlight.category}</span>
                                </p>
                            </div>
                        </div>

                        {/* Coach Feedback Section */}
                        {selectedHighlight.coachRating ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                                        <MessageCircle size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 uppercase">Coach Feedback</span>
                                </div>
                                <div className="flex items-center mb-2">
                                     {[1,2,3,4,5].map(star => (
                                         <Star 
                                            key={star} 
                                            size={16} 
                                            className={`${(selectedHighlight.coachRating || 0) / 2 >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                                         />
                                     ))}
                                     <span className="ml-2 text-sm font-black text-slate-700">{selectedHighlight.coachRating}/10</span>
                                </div>
                                {selectedHighlight.coachFeedback ? (
                                    <p className="text-sm text-slate-600 italic">"{selectedHighlight.coachFeedback}"</p>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No written feedback provided.</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                {selectedHighlight.status === 'pending' ? (
                                    <>
                                        <Clock size={24} className="text-slate-300 mb-2" />
                                        <p className="text-xs font-bold text-slate-400">Waiting for coach review</p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={24} className="text-emerald-300 mb-2" />
                                        <p className="text-xs font-bold text-slate-400">Content Approved</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex gap-3">
                             <button onClick={() => {}} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                                 Share Highlight
                             </button>
                             {selectedHighlight.status === 'pending' && (
                                 <button className="flex-none bg-red-50 text-red-500 font-bold p-3 rounded-xl hover:bg-red-100 transition-colors">
                                     <X size={20} />
                                 </button>
                             )}
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Add Award Modal */}
      <AnimatePresence>
        {showAwardModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 text-lg">Add Award</h3>
                        <button onClick={() => setShowAwardModal(false)}><X size={20} className="text-slate-400" /></button>
                    </div>
                    <div className="space-y-3">
                        <input 
                            className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200 outline-none focus:border-blue-500"
                            placeholder="Award Title (e.g. MVP)"
                            value={newAward.title}
                            onChange={e => setNewAward({...newAward, title: e.target.value})}
                        />
                        <input 
                            className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200 outline-none focus:border-blue-500"
                            placeholder="Issuer (e.g. League Name)"
                            value={newAward.issuer}
                            onChange={e => setNewAward({...newAward, issuer: e.target.value})}
                        />
                         <input 
                            type="date"
                            className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200 outline-none focus:border-blue-500"
                            value={newAward.date}
                            onChange={e => setNewAward({...newAward, date: e.target.value})}
                        />
                        <button 
                            onClick={handleAddAward}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-2"
                        >
                            Save Award
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
