import { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Successfully logged in!');
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Signup successful! Check your email to verify.');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google Auth failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-md p-8 relative shadow-2xl animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-neutral-500 mb-8">
          {isLogin 
            ? 'Enter your details to access your account.' 
            : 'Join Ali Electronics to unlock premium features.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="email" 
              placeholder="Email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-12 py-3.5 outline-none focus:border-neutral-900 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-12 py-3.5 outline-none focus:border-neutral-900 focus:bg-white transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neutral-900 text-white rounded-xl py-3.5 font-semibold mt-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isLogin ? 'Log in' : 'Sign up')}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-neutral-200 flex-1"></div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Or</span>
          <div className="h-px bg-neutral-200 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          className="w-full bg-white border border-neutral-200 text-neutral-700 rounded-xl py-3.5 font-semibold hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-neutral-500 mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-900 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
