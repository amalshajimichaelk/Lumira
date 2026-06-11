import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  className?: string;
  glowColor?: 'teal' | 'violet' | 'coral';
}

export function KpiCard({ title, value, trend, isPositive, icon: Icon, className, glowColor = 'teal' }: KpiCardProps) {
  const glowClass = {
    teal: 'glow-teal',
    violet: 'glow-violet',
    coral: 'glow-coral'
  }[glowColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white/5 border border-white/10 rounded-2xl p-5 transition-all cursor-default group backdrop-blur-md flex flex-col justify-between min-h-[140px] relative overflow-hidden", glowClass, className)}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${glowColor === 'teal' ? 'bg-[#00d4aa]/5 group-hover:bg-[#00d4aa]/10' : glowColor === 'violet' ? 'bg-[#7c3aed]/5 group-hover:bg-[#7c3aed]/10' : 'bg-[#ff6b6b]/5 group-hover:bg-[#ff6b6b]/10'}`}></div>
      
      <div className="flex justify-between items-start relative z-10 mb-2">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
             isPositive ? "text-[#00d4aa] bg-[#00d4aa]/10" : "text-[#ff6b6b] bg-[#ff6b6b]/10"
        )}>{trend}</span>
      </div>

      <div className="mt-2 relative z-10">
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
      </div>
    </motion.div>
  );
}
