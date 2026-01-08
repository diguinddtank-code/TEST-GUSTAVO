import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserProfile } from '../types';
import { Search, User, ChevronRight, LogOut, Shield } from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [athletes, setAthletes] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAthletes = async () => {
            try {
                // Fetch only users with role 'athlete'
                const q = query(collection(db, "users"), where("role", "==", "athlete"));
                const querySnapshot = await getDocs(q);
                const fetchedAthletes: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedAthletes.push(doc.data() as UserProfile);
                });
                setAthletes(fetchedAthletes);
            } catch (error) {
                console.error("Error fetching athletes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAthletes();
    }, []);

    const filteredAthletes = athletes.filter(a => 
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.club.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-8 rounded-b-[32px] shadow-xl shadow-slate-900/20 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
                            <Shield size={14} />
                            <span>Administrator</span>
                        </div>
                        <h1 className="text-3xl font-extrabold">Athlete Database</h1>
                        <p className="text-slate-400 text-sm mt-1">{athletes.length} Registered Players</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-3 flex items-center">
                    <Search className="text-slate-400 mr-3" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name or club..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent w-full outline-none text-white placeholder:text-slate-500 font-medium"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-6 pb-20 space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 font-bold">Loading Database...</div>
                ) : filteredAthletes.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-bold">No athletes found.</div>
                ) : (
                    filteredAthletes.map(athlete => (
                        <div key={athlete.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100">
                                    {athlete.avatarUrl ? (
                                        <img src={athlete.avatarUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-400" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{athlete.fullName}</h3>
                                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                                        <span className="font-semibold text-blue-600">{athlete.position}</span>
                                        <span>•</span>
                                        <span>{athlete.club}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">
                                    {athlete.stats.matches} Matches
                                </span>
                                <ChevronRight className="text-slate-300" size={16} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};