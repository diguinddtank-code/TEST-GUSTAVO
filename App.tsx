import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search'; 
import { Activity } from './pages/Activity'; 
import { Auth } from './pages/Auth';
import { Settings } from './pages/Settings';
import { UserProfile, MediaItem } from './types';

// Default Media Data (Mock)
const defaultMedia: MediaItem[] = [
  { id: '1', type: 'video', title: 'Goal vs Corinthians', date: '2d ago', status: 'approved', category: 'Match', thumbnailUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&fit=crop', duration: '00:45' },
  { id: '2', type: 'video', title: 'Dribbling Drills', date: '1w ago', status: 'featured', category: 'Training', thumbnailUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&fit=crop', duration: '01:20' },
  { id: '3', type: 'photo', title: 'Team Photo', date: '2w ago', status: 'approved', category: 'Physical', thumbnailUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&fit=crop' },
];

// Splash Screen Component
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade out after animation
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 500); 
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-700 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative animate-kick-in flex flex-col items-center">
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150"></div>
           <img 
              src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" 
              alt="Verum International Football Academy" 
              className="w-48 h-auto object-contain relative z-10 drop-shadow-xl"
           />
        </div>
        
        <div className="h-1 bg-slate-900 rounded-full mb-4 animate-line opacity-0"></div>

        <div className="text-center space-y-2 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-forwards px-8">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-[0.1em] uppercase">Pro Football Opportunity</h2>
            <p className="text-xs font-medium text-slate-400">and Education Pathway</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(defaultMedia);

  // Load user and media from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('verum_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }

    const savedMedia = localStorage.getItem('verum_media');
    if (savedMedia) {
        // Merge saved media with defaults or just replace
        setMediaItems(JSON.parse(savedMedia));
    }
  }, []);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('verum_user', JSON.stringify(newUser));
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('verum_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('verum_user');
    setCurrentTab('dashboard');
  };

  const handleAddMedia = (newItem: MediaItem) => {
      const updatedMedia = [newItem, ...mediaItems];
      setMediaItems(updatedMedia);
      // Try/Catch for LocalStorage quota limits (videos can be large)
      try {
        localStorage.setItem('verum_media', JSON.stringify(updatedMedia));
      } catch (e) {
          console.warn("Storage quota exceeded, media saved in session only.");
      }
      setCurrentTab('gallery');
  };

  const renderContent = () => {
    if (!user) return null;

    switch (currentTab) {
      case 'dashboard':
        return <Home user={user} />;
      case 'gallery':
        return <Search mediaItems={mediaItems} />;
      case 'upload':
        return <Upload onNavigate={setCurrentTab} onAddMedia={handleAddMedia} />;
      case 'inbox':
        return <Activity />;
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'settings':
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return <Home user={user} />;
    }
  };

  if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
      return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl shadow-slate-200 overflow-hidden ring-1 ring-slate-900/5">
        
        {/* Header - Dashboard Only */}
        {currentTab === 'dashboard' && (
            <div className="px-6 h-24 glass-nav sticky top-0 z-30 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center">
                    <img 
                        src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" 
                        alt="Verum Academy" 
                        className="h-12 w-auto object-contain" 
                    />
                </div>
                <div className="relative cursor-pointer hover:scale-105 transition-transform group" onClick={() => setCurrentTab('profile')}>
                    <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-slate-100 shadow-sm overflow-hidden group-hover:border-slate-300 transition-colors flex items-center justify-center">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="font-bold text-slate-900">{user.fullName.charAt(0)}</span>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
                </div>
            </div>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
          {renderContent()}
        </main>

        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </div>
  );
};

export default App;