import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
          // LOGIN LOGIC
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          // Fetch user profile from Firestore
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
              onLogin(docSnap.data() as UserProfile);
          } else {
              setError("User profile not found in database.");
          }

      } else {
          // SIGN UP LOGIC
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          // SECRET ADMIN HACK FOR TESTING:
          // If email contains "admin", create as admin role automatically
          const role = email.includes('admin') ? 'admin' : 'athlete';

          const newUser: UserProfile = {
            id: uid,
            email: email,
            role: role,
            fullName: name,
            username: name.toLowerCase().replace(/\s/g, '_'),
            avatarUrl: '', 
            position: '-',
            club: '-',
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

          // Save to Firestore
          await setDoc(doc(db, "users", uid), newUser);
          onLogin(newUser);
      }
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Authentication failed. Check your config.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
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
           {error && (
               <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100 text-center font-bold">
                   {error}
               </div>
           )}

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