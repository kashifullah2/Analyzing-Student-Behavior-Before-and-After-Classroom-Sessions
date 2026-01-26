import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, User, Mail, Phone, MapPin, ArrowRight, 
  Activity, Sparkles, AlertCircle, CheckCircle, Loader2 
} from 'lucide-react';

// --- SHARED SPLIT LAYOUT ---
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex w-full bg-slate-50">
    
    {/* LEFT BRANDING */}
    <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      
      <div className="relative z-10 text-center max-w-lg">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
           <Activity size={48} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-6 tracking-tight">EduMotion AI</h1>
        <p className="text-indigo-100 text-xl font-light">
          Real-time emotional intelligence analytics for the modern classroom.
        </p>
      </div>
    </div>

    {/* RIGHT FORM AREA */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center lg:text-left">
           <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
           <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

// --- LOGIN COMPONENT ---
export const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' }); // New Status State
  const [loading, setLoading] = useState(false);               // New Loading State
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await axios.post('http://localhost:8000/login', { username, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) { 
      // Capture Backend Error Message
      const errorMsg = err.response?.data?.detail || "Connection Failed";
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your dashboard.">
      
      {/* Error Message Banner */}
      {status.msg && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
          {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 transition-all" 
              placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
            <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-indigo-500 transition-all" 
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        New here? <a href="/signup" className="text-indigo-600 font-bold hover:underline">Create an account</a>
      </p>
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
      await axios.post('http://localhost:8000/signup', formData);
      
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
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium animate-fade-in-up ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
          {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Username</label>
            <input name="username" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
          </div>
          <div>
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
             <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone</label>
                 <input name="phone" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
            </div>
            <div>
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Gender</label>
                 <select name="gender" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all bg-white" onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
        </div>

        <div>
             <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address</label>
             <input name="address" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password</label>
              <input name="password" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
           </div>
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Confirm</label>
              <input name="confirm_password" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all" onChange={handleChange} required />
           </div>
        </div>

        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="animate-spin" /> : <>Get Started <Sparkles size={18} /></>}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account? <a href="/" className="text-indigo-600 font-bold hover:underline">Log in here</a>
      </p>
    </AuthLayout>
  );
};