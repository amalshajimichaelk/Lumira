import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { dataService } from '../services/api';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Revenue() {
  const [timeRange, setTimeRange] = useState('12m');
  const groupParam = timeRange === '30d' ? 'day' : timeRange === '12m' ? 'month' : 'year';
  const { data, isLoading } = useQuery({ queryKey: ['revenue', timeRange], queryFn: () => dataService.getRevenue({ group: groupParam }) });

  if (isLoading) return <div className="text-white">Loading...</div>;

  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    if (timeRange === '30d') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (timeRange === '12m') return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    return d.getFullYear().toString();
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Wallet className="w-8 h-8 text-primary" /> Revenue Analytics</h2>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {['30d', '12m', '5y'].map(t => (
            <button key={t} onClick={() => setTimeRange(t)} className={"px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all " + (timeRange === t ? "bg-[#ff6b6b] text-white" : "text-slate-400 hover:text-white")}>{t}</button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4 shrink-0">Revenue Trajectory</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.data?.map((d: any) => ({ date: formatXAxis(d.period), revenue: d.total })) || []} margin={{ left: 30, right: 20, bottom: 5, top: 10 }}>
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}