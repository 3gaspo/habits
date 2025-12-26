
import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800">HabitFlow</h1>
          <p className="text-slate-500 font-medium">{isLogin ? 'Sign in to your account' : 'Create your new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

          <button 
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-emerald-600 hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
