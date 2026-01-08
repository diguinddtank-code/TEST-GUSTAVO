import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search'; 
import { Activity } from './pages/Activity'; 
import { Auth } from './pages/Auth';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile, MediaItem } from './types';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';

// Enhanced Splash Screen
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 1.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <img 
            src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" 
            alt="Verum" 
            className="w-48 h-auto object-contain relative z-10"
        />
      </motion.div>
    </motion.div>
  );
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Real-time User & Media Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Real-time user listener
            const userRef = doc(db, "users", firebaseUser.uid);
            const unsubUser = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUser(docSnap.data() as UserProfile);
                }
            });

            // Real-time media listener
            const q = query(collection(db, "media"), where("userId", "==", firebaseUser.uid));
            const unsubMedia = onSnapshot(q, (snapshot) => {
                const items: MediaItem[] = [];
                snapshot.forEach((doc) => {
                    items.push({ ...doc.data(), id: doc.id } as MediaItem);
                });
                // Sort by date desc
                setMediaItems(items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            });

            setLoadingUser(false);
            return () => {
                unsubUser();
                unsubMedia();
            };
        } else {
            setUser(null);
            setMediaItems([]);
            setLoadingUser(false);
        }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser); // Optimistic
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentTab('dashboard');
  };

  const renderContent = () => {
    if (!user) return null;

    if (user.role === 'admin') {
        return <AdminDashboard onLogout={handleLogout} />;
    }

    // Pass mediaItems to Home for analytics if needed
    switch (currentTab) {
      case 'dashboard':
        return <Home user={user} mediaItems={mediaItems} onNavigate={setCurrentTab} />;
      case 'gallery':
        return <Search mediaItems={mediaItems} />;
      case 'upload':
        return <Upload onNavigate={setCurrentTab} onAddMedia={() => {}} />; // AddMedia handled by firestore listener
      case 'inbox':
        return <Activity />;
      case 'profile':
        return <Profile user={user} onUpdateUser={() => {}} />;
      case 'settings':
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return <Home user={user} mediaItems={mediaItems} onNavigate={setCurrentTab} />;
    }
  };

  if (showSplash || loadingUser) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
      return <Auth onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
      return renderContent();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col relative shadow-2xl shadow-black overflow-hidden">
        
        {/* Dynamic Header */}
        <AnimatePresence mode="wait">
        {currentTab === 'dashboard' && (
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="px-6 h-20 glass-nav sticky top-0 z-30 flex justify-between items-center"
            >
                <div className="flex items-center">
                    <img 
                        src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" 
                        alt="Verum" 
                        className="h-10 w-auto object-contain" 
                    />
                </div>
                <div onClick={() => setCurrentTab('profile')} className="relative cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold">{user.fullName[0]}</div>
                        )}
                    </div>
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Main Content Area with Transitions */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50 relative">
          <AnimatePresence mode="wait">
            <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
            >
                {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
};

export default App;