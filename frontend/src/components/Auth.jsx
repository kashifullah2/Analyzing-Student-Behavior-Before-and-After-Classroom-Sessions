import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Lock, User, Mail, Phone, MapPin, ArrowRight,
  Activity, Sparkles, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, ShieldCheck, Zap
} from 'lucide-react';

// Reusable Password Field with visibility toggle
const PasswordInput = ({ value, onChange, placeholder, name = "password" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
      <input
        type={show ? "text" : "password"}
        name={name}
        className="input-field pl-12 pr-12"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

// --- MODERN SPLIT LAYOUT SHELL ---
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex w-full font-sans bg-slate-50">

    {/* LEFT HERO: HIGH TECH VISUALS */}
    <div className="hidden lg:flex w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30 backdrop-blur-md">
            <Activity className="text-indigo-400" size={24} />
          </div>
          <span className="text-xl font-bold font-[Outfit] tracking-tight">Behavior<span className="text-indigo-400">Analyzer</span></span>
        </div>

        <h1 className="text-5xl font-bold font-[Outfit] leading-[1.1] mb-6 text-white/95">
          Intelligence for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Classroom Excellence.</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
          Harness AI-driven behavioral analytics to elevate teaching results and student engagement in real-time.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:border-white/20 transition-all">
          <Zap className="text-yellow-400 mb-3" size={22} />
          <div className="font-semibold text-white mb-1">Instant Insights</div>
          <div className="text-xs text-slate-500 leading-tight">Zero-latency behavior analysis for faster decisions.</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:border-white/20 transition-all">
          <ShieldCheck className="text-emerald-400 mb-3" size={22} />
          <div className="font-semibold text-white mb-1">Privacy First</div>
          <div className="text-xs text-slate-500 leading-tight">Enterprise-grade encryption and data anonymization.</div>
        </div>
      </div>
    </div>

    {/* RIGHT PANEL: CLEAN LOGIN/SIGNUP FORM */}
    <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-y-auto">
      <div className="w-full max-w-[420px] animate-enter">
        {/* Mobile Logo Visibility */}
        <div className="lg:hidden mb-12 flex flex-col items-center">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-600/20">
            <Activity className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold font-[Outfit]">BehaviorAnalyzer</h2>
        </div>

        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-slate-900 font-[Outfit] mb-3">{title}</h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>

        {children}

      </div>

      {/* Footer Branding */}
      <div className="mt-auto pt-10 text-center text-xs text-slate-400 font-medium">
        © 2026 BehaviorAnalyzer Platform
        <span className="mx-2 text-slate-200">|</span>
        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
      </div>
    </div>
  </div>
);

// LOGIN COMPONENT
export const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // Backend expects 'username', so we send the 'email' value as 'username'
      const res = await api.post('/login', { username: email, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Invalid credentials or network issue.";
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back! Please enter your credentials.">

      {status.msg && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-enter ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {status.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle size={18} className="mt-0.5 shrink-0" />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
            <input className="input-field pl-12"
              type="email"
              placeholder="jane@school.org" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>
          </div>
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <button disabled={loading} className="w-full btn-primary mt-4">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500 font-medium">
          New to the platform? <a href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Create account</a>
        </p>
      </div>
    </AuthLayout>
  );
};

// --- SIGNUP COMPONENT ---
export const Signup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    address: '',
    password: '',
    confirm_password: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (formData.password !== formData.confirm_password) {
      setStatus({ type: 'error', msg: "Passwords do not match." });
      return;
    }
    if (formData.password.length < 6) {
      setStatus({ type: 'error', msg: "Security requirement: Min 6 characters." });
      return;
    }

    setLoading(true);

    try {
      // Note: Backend might require 'username'. If so, we use email as username.
      const payload = { ...formData, username: formData.email };
      await api.post('/signup', payload);
      setStatus({ type: 'success', msg: "Account created! Secure your portal now..." });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Registration encountered an error.";
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Registration" subtitle="Start analyzing your classroom behavior today.">

      {status.msg && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-enter ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
          {status.type === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle size={18} className="mt-0.5 shrink-0" />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Line 1: First Name, Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">First Name</label>
            <input name="first_name" className="input-field" placeholder="Jane" onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
            <input name="last_name" className="input-field" placeholder="Doe" onChange={handleChange} required />
          </div>
        </div>

        {/* Line 2: Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
          <input name="email" type="email" className="input-field" placeholder="jane@school.org" onChange={handleChange} required />
        </div>

        {/* Line 3: Phone, Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone</label>
            <input name="phone" className="input-field" placeholder="+1 (555) 000-0000" onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
            <select name="gender" className="input-field cursor-pointer" onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Line 4: Address */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Address</label>
          <input name="address" className="input-field" placeholder="Department, Campus, City" onChange={handleChange} required />
        </div>

        {/* Line 5: Password, Confirm Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Create Password</label>
            <PasswordInput name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
            <PasswordInput name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="••••••••" />
          </div>
        </div>

        <button disabled={loading} className="w-full btn-primary py-3 rounded-lg text-sm mt-4">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Complete Signup <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Member already? <a href="/" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Log in</a>
        </p>
      </div>
    </AuthLayout>
  );
};