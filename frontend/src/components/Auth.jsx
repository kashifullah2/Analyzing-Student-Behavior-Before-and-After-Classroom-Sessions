import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Lock, User, Mail, Phone, MapPin, ArrowRight,
  Activity, Sparkles, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';

// --- SHARED SPLIT LAYOUT ---
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex w-full bg-blobs relative overflow-hidden font-sans">

    {/* LEFT BRANDING */}
    <div className="hidden lg:flex w-5/12 ml-6 my-6 rounded-3xl bg-slate-900 relative overflow-hidden flex-col justify-between p-12 shadow-2xl shadow-indigo-500/20 z-10 transition-all hover:scale-[1.005] duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 opacity-90" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />

      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="relative z-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-lg">
          <Activity size={32} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-white font-[Outfit]">
          Behavior<br /><span className="text-indigo-200">Analyzer</span>
        </h1>
        <p className="text-indigo-100 text-lg font-light leading-relaxed max-w-sm">
          Unlock the power of emotional intelligence in your classroom with real-time AI analytics.
        </p>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors cursor-default">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-indigo-500/50 shadow-sm" />
            ))}
          </div>
          <div className="text-white text-sm">
            <span className="font-bold">Trusted by</span><br />
            Leading Educators
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT FORM AREA */}
    <div className="w-full lg:w-7/12 flex items-center justify-center p-8 z-10">
      <div className="w-full max-w-[420px] space-y-8 animate-enter">
        <div className="text-center">
          <h2 className="heading-xl mb-3">{title}</h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>

        {/* Glass Card Container for Form */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-xl shadow-indigo-500/5">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// --- LOGIN COMPONENT ---
export const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await api.post('/login', { username, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Connection Failed";
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your journey.">

      {status.msg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-green-50 text-green-600 ring-1 ring-green-100'}`}>
          {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Username</label>
          <div className="relative group">
            <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
            <input className="input-field pl-12"
              placeholder="e.g. teacher_smith" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
            <input type="password" className="input-field pl-12"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>

        <button disabled={loading} className="w-full btn-primary py-4 rounded-xl text-lg shadow-lg shadow-indigo-500/30 mt-2">
          {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
        </button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          New here? <a href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Create an account</a>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- SIGNUP COMPONENT ---
export const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', gender: 'Male', address: '', password: '', confirm_password: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    // 1. Frontend Validation
    if (formData.password !== formData.confirm_password) {
      setStatus({ type: 'error', msg: "Passwords do not match." });
      return;
    }
    if (formData.password.length < 4) {
      setStatus({ type: 'error', msg: "Password must be at least 4 characters." });
      return;
    }

    setLoading(true);

    // 2. API Call
    try {
      await api.post('/signup', formData);

      // 3. Success Feedback
      setStatus({ type: 'success', msg: "Account created successfully! Redirecting..." });

      // 4. Delay Redirect so user sees message
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      // 5. Backend Validation Feedback (e.g. "Username taken")
      const errorMsg = err.response?.data?.detail || "Registration Failed. Please try again.";
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the platform to start monitoring.">

      {/* FEEDBACK MESSAGE BANNER */}
      {status.msg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-fade-in-up ${status.type === 'error' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-green-50 text-green-600 ring-1 ring-green-100'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Username</label>
            <input name="username" className="input-field" placeholder="e.g. alex_rivera" onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Email</label>
            <input name="email" type="email" className="input-field" placeholder="alex@school.edu" onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Phone</label>
            <input name="phone" className="input-field" placeholder="(555) 123-4567" onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Gender</label>
            <select name="gender" className="input-field bg-white/50" onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Address</label>
          <input name="address" className="input-field" placeholder="123 Academic Way, Springfield" onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Password</label>
            <input name="password" type="password" className="input-field" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5 ml-1">Confirm</label>
            <input name="confirm_password" type="password" className="input-field" placeholder="••••••••" onChange={handleChange} required />
          </div>
        </div>

        <button disabled={loading} className="w-full btn-primary py-4 rounded-xl text-lg mt-6 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all">
          {loading ? <Loader2 className="animate-spin" /> : <>Create Account <Sparkles size={18} /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account? <a href="/" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Log in here</a>
        </p>
      </div>
    </AuthLayout>
  );
};