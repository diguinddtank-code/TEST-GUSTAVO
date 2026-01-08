import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      let newUser: UserProfile;

      if (isLogin) {
          // DEMO LOGIN: Loads the populated "Diego" profile for demonstration
          newUser = {
            id: 'demo_user',
            email: email || 'diego@verum.com',
            fullName: 'Diego Silva',
            username: 'diego_10',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            position: 'Attacking Midfielder',
            club: 'Flamengo U17',
            bio: 'Focused on reaching the pros.',
            physical: {
              height: '1.78m',
              weight: '68kg',
              foot: 'Right',
              age: '17'
            },
            stats: {
              matches: 24,
              goals: 12,
              assists: 8
            }
          };
      } else {
          // SIGN UP: Creates a RAW, clean profile that the user must configure
          newUser = {
            id: Date.now().toString(),
            email: email,
            fullName: name,
            username: name.toLowerCase().replace(/\s/g, '_'),
            avatarUrl: '', // Empty initially
            position: '-', // Placeholder
            club: '-', // Placeholder
            bio: 'Profile not configured.',
            physical: {
              height: '-',
              weight: '-',
              foot: '-',
              age: '-'
            },
            stats: {
              matches: 0,
              goals: 0,
              assists: 0
            }
          };
      }

      onLogin(newUser);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor - Subtle for Light Theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
           <img 
              src="https://www.goverum.com/wp-content/uploads/2025/12/verum-international-football-academy-bk-logo.png" 
              alt="Verum Academy" 
              className="h-20 w-auto mx-auto mb-6 object-contain"
           />
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
             {isLogin ? 'Welcome Back' : 'Join the Elite'}
           </h1>
           <p className="text-slate-500 font-medium">
             {isLogin ? 'Access your athlete portal.' : 'Start your pro football journey today.'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {!isLogin && (
              <div className="group bg-white border border-slate-200 rounded-2xl p-1 flex items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
                  <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 w-full h-12 font-medium outline-none"
                    required
                  />
              </div>
           )}

           <div className="group bg-white border border-slate-200 rounded-2xl p-1 flex items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 w-full h-12 font-medium outline-none"
                required
              />
           </div>

           <div className="group bg-white border border-slate-200 rounded-2xl p-1 flex items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 w-full h-12 font-medium outline-none"
                required
              />
           </div>

           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-6 border border-slate-900"
           >
             {isLoading ? (
               <Loader2 size={20} className="animate-spin" />
             ) : (
               <>
                 <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                 <ArrowRight size={20} />
               </>
             )}
           </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-600 font-extrabold hover:text-blue-700 transition-colors ml-1"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};