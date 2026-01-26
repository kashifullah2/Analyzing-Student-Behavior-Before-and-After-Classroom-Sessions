import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Phone, MapPin, ArrowRight, Activity } from 'lucide-react';

// Shared Layout for Auth Pages
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
          <Activity className="text-white w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 mt-2">{subtitle}</p>
      </div>
      <div className="glass-panel p-8 rounded-3xl border border-white/10">
        {children}
      </div>
    </div>
  </div>
);

export const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/login', { username, password });
      setToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) { alert("Invalid Credentials"); }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your analytics dashboard">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input type="text" className="modern-input pl-10" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-3 text-slate-500 h-5 w-5" />
            <input type="password" className="modern-input pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>
        <button className="w-full btn-primary mt-6 flex justify-center items-center gap-2">
          Access System <ArrowRight size={18} />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New Instructor? <a href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Register Account</a>
      </p>
    </AuthLayout>
  );
};

export const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', gender: 'Male', address: '', password: '', confirm_password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) return alert("Passwords mismatch");
    try {
      await axios.post('http://localhost:8000/signup', formData);
      navigate('/');
    } catch (err) { alert("Registration Failed"); }
  };

  return (
    <AuthLayout title="Instructor Portal" subtitle="Create your new account">
      <form onSubmit={handleSignup} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
           <input name="username" placeholder="Username" className="modern-input" onChange={handleChange} required />
           <input name="email" type="email" placeholder="Email" className="modern-input" onChange={handleChange} required />
        </div>
        <input name="phone" placeholder="Phone" className="modern-input" onChange={handleChange} required />
        <select name="gender" className="modern-input bg-slate-900" onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </select>
        <input name="address" placeholder="Address" className="modern-input" onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
           <input name="password" type="password" placeholder="Password" className="modern-input" onChange={handleChange} required />
           <input name="confirm_password" type="password" placeholder="Confirm" className="modern-input" onChange={handleChange} required />
        </div>
        <button className="w-full btn-primary mt-4">Create Account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <a href="/" className="text-indigo-400 hover:text-indigo-300 font-medium">Back to Login</a>
      </p>
    </AuthLayout>
  );
};