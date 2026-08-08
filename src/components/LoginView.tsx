import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  RefreshCw,
  Globe,
  Flame
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LanguageCode } from '../types';

interface LoginViewProps {
  language: LanguageCode;
  onLogin: (email: string) => void;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onLogin,
  onLanguageChange,
}) => {
  const isTamil = language === 'ta';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetAccounts: Record<string, string> = {
    'sathishkumar0076767@gmail.com': 'admin123456',
    'admin@swatea.ai': 'admin123456',
    'user@gmail.com': 'user123456',
    'developer@swatea.ai': 'dev123456',
  };

  const getRegisteredAccounts = (): Record<string, string> => {
    try {
      const saved = localStorage.getItem('swatea_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...presetAccounts, ...parsed };
      }
    } catch (e) {}
    return presetAccounts;
  };

  const registerLocalAccount = (accEmail: string, accPass: string) => {
    try {
      const current = getRegisteredAccounts();
      current[accEmail.toLowerCase().trim()] = accPass;
      localStorage.setItem('swatea_registered_accounts', JSON.stringify(current));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const lowerEmail = cleanEmail.toLowerCase();

    if (!cleanEmail) {
      setError(isTamil ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்.' : 'Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(
        isTamil
          ? 'செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும் (e.g. user@gmail.com).'
          : 'Please enter a valid email address (e.g. user@gmail.com).'
      );
      return;
    }
    if (!cleanPassword) {
      setError(isTamil ? 'கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter your password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setError(
        isTamil
          ? 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    setError('');
    setLoading(true);

    const accounts = getRegisteredAccounts();

    try {
      if (isSignUp) {
        // Sign Up Mode
        if (accounts[lowerEmail] && accounts[lowerEmail] !== cleanPassword) {
          setError(
            isTamil
              ? 'இந்த மின்னஞ்சல் ஏற்கனவே வேறு கடவுச்சொல்லுடன் பதிவு செய்யப்பட்டுள்ளது.'
              : 'An account with this email already exists with a different password.'
          );
          setLoading(false);
          return;
        }

        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        } catch (fbErr) {
          // If Firebase is disabled or fails, we still register locally
        }

        registerLocalAccount(cleanEmail, cleanPassword);
        onLogin(cleanEmail);
        return;
      } else {
        // Sign In Mode
        // 1. Try Firebase Auth
        let fbSuccess = false;
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          fbSuccess = true;
        } catch (err: any) {
          if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
            setError(
              isTamil
                ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். தயவுசெய்து சரிபார்க்கவும்.'
                : 'Invalid email or password. Please check your credentials.'
            );
            setLoading(false);
            return;
          }
        }

        if (fbSuccess) {
          registerLocalAccount(cleanEmail, cleanPassword);
          onLogin(cleanEmail);
          return;
        }

        // 2. Local Account Verification
        const storedPass = accounts[lowerEmail];
        if (storedPass) {
          if (storedPass === cleanPassword) {
            onLogin(cleanEmail);
            return;
          } else {
            setError(
              isTamil
                ? 'தவறான கடவுச்சொல்! சரியான கடவுச்சொல்லை உள்ளிடவும்.'
                : 'Incorrect password! Please enter the correct password.'
            );
            setLoading(false);
            return;
          }
        } else {
          setError(
            isTamil
              ? 'கணக்கு எதுவும் கிடைக்கவில்லை! தயவுசெய்து "புதிய கணக்கு உருவாக்கு" (Sign Up) என்பதை கிளிக் செய்து கணக்கை தொடங்கவும்.'
              : 'No account found with this email. Please click "Sign Up" to create an account.'
          );
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setError(
        isTamil
          ? 'உள்நுழைவதில் பிழை ஏற்பட்டது. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (account: { email: string; pass: string }) => {
    setEmail(account.email);
    setPassword(account.pass);
    setError('');
    onLogin(account.email);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Radial Glowing Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Language Bar Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-md">
        <Globe className="w-4 h-4 text-amber-400 ml-2" />
        <button
          onClick={() => onLanguageChange('ta')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            language === 'ta'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          தமிழ் 🇮🇳
        </button>
        <button
          onClick={() => onLanguageChange('en')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          English 🇺🇸
        </button>
      </div>

      {/* Main Login Glass Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 p-[2px] shadow-xl shadow-rose-950/50 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            SWATEA <span className="text-amber-400">AI</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isTamil
              ? 'ஆப்-ஐ அணுக மின்னஞ்சல் ஐடி மற்றும் கடவுச்சொல்லை உள்ளிட்டு உள்நுழையவும்.'
              : 'Enter your Email ID and Password to securely log in to the application.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !isSignUp
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isTamil ? 'உள்நுழைக (Sign In)' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSignUp
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பதிவு செய்க (Sign Up)' : 'Sign Up'}</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTamil ? 'மின்னஞ்சல் ஐடி (Email ID)' : 'Email Address'}</span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner font-mono"
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isTamil ? 'கடவுச்சொல் (Password)' : 'Password'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Min 6 chars</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-[12px] font-semibold text-rose-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-slate-950 font-black rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>
                  {isSignUp
                    ? isTamil ? 'கணக்கு உருவாக்கு (Create Account)' : 'Create Account & Login'
                    : isTamil ? 'உள்நுழைக (Sign In)' : 'Sign In to Swatea AI'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-600 font-mono pt-2 border-t border-slate-800/60">
          Swatea Enterprise AI OS
        </div>
      </div>
    </div>
  );
};

