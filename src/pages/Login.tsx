import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authService } from '../services/api';
import { Activity } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const onSubmit = async (data?: any) => {
    if (data && data.preventDefault) data.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { email: email || data?.email, password: password || data?.password };
      const res = await authService.login(payload);
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0B1121] flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl w-full max-w-md backdrop-blur-xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border-4 border-white/5">
             <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Lumira</h1>
          <p className="text-slate-400">Sign in to access your dashboard</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {errorMsg && <div className="text-red-400 bg-red-400/10 p-3 rounded-xl text-sm font-semibold">{errorMsg}</div>}
          <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" disabled={isSubmitting} className="bg-primary text-black font-bold py-3 rounded-xl hover:bg-[#34e0b3] transition-colors mt-2">Sign In</button>
          <button type="button" onClick={() => onSubmit({ email: 'admin@lumira.com', password: 'Admin@1234' })} disabled={isSubmitting} className="bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors mt-2">Try Demo Mode</button>
        </form>
      </div>
    </div>
  );
}
