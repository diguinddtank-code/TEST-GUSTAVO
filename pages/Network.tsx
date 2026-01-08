import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Search, UserPlus, UserCheck, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkProps {
    currentUser: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
}

export const Network: React.FC<NetworkProps> = ({ currentUser, onUpdateUser }) => {
    const [athletes, setAthletes] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAthletes = async () => {
            // In a real app with thousands of users, use Algolia or specialized search.
            // For now, fetch top 50 athletes.
            const q = query(collection(db, "users"), where("role", "==", "athlete"));
            const snapshot = await getDocs(q);
            const users: UserProfile[] = [];
            snapshot.forEach(doc => {
                if (doc.id !== currentUser.id) { // Don't show self
                    users.push({ ...doc.data(), id: doc.id } as UserProfile);
                }
            });
            setAthletes(users);
            setLoading(false);
        };
        fetchAthletes();
    }, [currentUser.id]);

    const handleFollow = async (targetId: string) => {
        const isFollowing = currentUser.following?.includes(targetId);
        
        // Optimistic UI Update
        const updatedFollowing = isFollowing 
            ? currentUser.following?.filter(id => id !== targetId) || []
            : [...(currentUser.following || []), targetId];
        
        onUpdateUser({ ...currentUser, following: updatedFollowing });

        try {
            const currentUserRef = doc(db, "users", currentUser.id);
            const targetUserRef = doc(db, "users", targetId);

            if (isFollowing) {
                await updateDoc(currentUserRef, { following: arrayRemove(targetId) });
                await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.id) });
            } else {
                await updateDoc(currentUserRef, { following: arrayUnion(targetId) });
                await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.id) });
            }
        } catch (e) {
            console.error("Follow error", e);
            // Revert would go here
        }
    };

    const filteredAthletes = athletes.filter(a => 
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.club.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-32 pt-6 px-6 h-full flex flex-col bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Network</h1>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center sticky top-0 z-10">
                <Search className="text-slate-400 ml-2" size={20} />
                <input 
                    className="w-full p-2 outline-none text-slate-900 font-bold placeholder:text-slate-400"
                    placeholder="Find athletes, positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                 <div className="text-center py-10 text-slate-400 font-bold animate-pulse">Loading athletes...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAthletes.map((athlete) => {
                        const isFollowing = currentUser.following?.includes(athlete.id);
                        
                        return (
                            <motion.div 
                                layoutId={athlete.id}
                                key={athlete.id} 
                                className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex-shrink-0 overflow-hidden">
                                        {athlete.avatarUrl ? (
                                            <img src={athlete.avatarUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{athlete.fullName[0]}</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{athlete.fullName}</h3>
                                        <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{athlete.position}</span>
                                            {athlete.club !== '-' && (
                                                <span className="flex items-center truncate">
                                                    <Shield size={10} className="mr-1" /> {athlete.club}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleFollow(athlete.id)}
                                    className={`p-3 rounded-xl transition-all active:scale-95 ${
                                        isFollowing 
                                        ? 'bg-slate-100 text-slate-900' 
                                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    }`}
                                >
                                    {isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
