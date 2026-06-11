import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Save, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';

export default function Settings() {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => document.body.classList.contains('light-mode') ? 'light' : 'dark');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [theme]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><SettingsIcon className="w-8 h-8 text-slate-400" /> System Configuration</h2>
        </div>
        <button onClick={handleSave} className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <motion.div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center gap-4">
             <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
               <User className="w-10 h-10 text-primary" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white">{user?.name || 'Administrator'}</h3>
               <p className="text-sm text-slate-400">{user?.email}</p>
             </div>
          </div>
        </motion.div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <motion.div className="bg-white/5 border border-white/10 rounded-3xl p-6">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Moon className="w-5 h-5" /> Appearance</h3>
             <div className="flex gap-4">
                <button onClick={() => setTheme('dark')} className={"flex-1 p-4 rounded-2xl border " + (theme === 'dark' ? "border-primary bg-primary/10" : "border-white/10 bg-white/5")}>
                  <span className="font-semibold text-white">Dark Mode</span>
                </button>
                <button onClick={() => setTheme('light')} className={"flex-1 p-4 rounded-2xl border " + (theme === 'light' ? "border-primary bg-primary/10" : "border-white/10 bg-white/5")}>
                  <span className="font-semibold text-white">Light Mode</span>
                </button>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}