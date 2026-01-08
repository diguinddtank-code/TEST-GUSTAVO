import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface AgendaProps {
    user: UserProfile;
}

interface AgendaItem {
    id: string;
    userId: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string;
    type: 'Match' | 'Training' | 'Reminder';
    location?: string;
    notes?: string;
}

export const Agenda: React.FC<AgendaProps> = ({ user }) => {
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'Training',
        location: ''
    });

    useEffect(() => {
        // Fetch User Agenda
        const q = query(
            collection(db, "agenda"), 
            where("userId", "==", user.id)
            // Note: orderBy needs a composite index in Firestore, skipping for simple MVP or doing client sort
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loaded: AgendaItem[] = [];
            snapshot.forEach(doc => {
                loaded.push({ ...doc.data(), id: doc.id } as AgendaItem);
            });
            // Client-side sort
            loaded.sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
            setItems(loaded);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.id]);

    const handleAddItem = async () => {
        if(!newItem.title || !newItem.date) return;
        
        try {
            await addDoc(collection(db, "agenda"), {
                ...newItem,
                userId: user.id,
                createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setNewItem({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Training', location: '' });
        } catch(e) {
            console.error(e);
            alert("Could not save event");
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("Delete this event?")) {
            await deleteDoc(doc(db, "agenda", id));
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
    }

    return (
        <div className="pb-32 pt-6 px-6 h-full flex flex-col bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Agenda</h1>
                    <p className="text-sm text-slate-500 font-medium">Organize your career.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 opacity-50">Loading agenda...</div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon size={32} className="text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">No events planned</h3>
                    <p className="text-sm text-slate-500 max-w-xs mt-1">Keep track of your matches, training sessions, and personal reminders here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <motion.div 
                            layoutId={item.id}
                            key={item.id}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex space-x-4">
                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${
                                        item.type === 'Match' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                        item.type === 'Training' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                        'bg-slate-50 border-slate-100 text-slate-500'
                                    }`}>
                                        <span className="text-[10px] font-bold uppercase">{new Date(item.date).toLocaleString('en-US', {weekday: 'short'})}</span>
                                        <span className="text-xl font-black leading-none">{new Date(item.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                item.type === 'Match' ? 'bg-blue-100 text-blue-700' : 
                                                item.type === 'Training' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-slate-400 font-bold flex items-center">
                                                <Clock size={10} className="mr-1" /> {item.time}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.title}</h3>
                                        {item.location && (
                                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center">
                                                <MapPin size={12} className="mr-1" /> {item.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Event Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 relative z-10 shadow-2xl"
                        >
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Add Event</h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {['Training', 'Match', 'Reminder'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setNewItem({...newItem, type: t as any})}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                                newItem.type === t 
                                                ? 'bg-slate-900 text-white border-slate-900' 
                                                : 'bg-white text-slate-500 border-slate-200'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                                    placeholder="Event Title (e.g. Gym Session)"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                                        value={newItem.date}
                                        onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                                    />
                                    <input 
                                        type="time"
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                                        value={newItem.time}
                                        onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                                    />
                                </div>

                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                                    placeholder="Location (Optional)"
                                    value={newItem.location}
                                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                                />

                                <button 
                                    onClick={handleAddItem}
                                    disabled={!newItem.title || !newItem.date}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-transform mt-4"
                                >
                                    Save to Agenda
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
