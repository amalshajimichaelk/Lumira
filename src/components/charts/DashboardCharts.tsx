import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', count: 120 }, { day: 'Tue', count: 150 }, { day: 'Wed', count: 140 },
  { day: 'Thu', count: 200 }, { day: 'Fri', count: 180 }, { day: 'Sat', count: 250 },
  { day: 'Sun', count: 220 }
];

const monthlyData = [
  { day: 'W1', count: 850 }, { day: 'W2', count: 920 }, 
  { day: 'W3', count: 1040 }, { day: 'W4', count: 980 }
];

const revenueData = [
  { name: 'Surgery', value: 40, color: '#00d4aa' },
  { name: 'Cardiology', value: 35, color: '#7c3aed' },
  { name: 'Emergency', value: 25, color: '#ffffff' },
];

export function DashboardCharts() {
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly'>('Weekly');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* Area Chart: Patient Visits */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:col-span-8 flex flex-col min-h-[360px] backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Patient Influx Trend</h3>
            <p className="text-xs text-slate-500">Aggregated visits vs previous period</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button onClick={() => setTimeframe('Weekly')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeframe === 'Weekly' ? 'bg-[#00d4aa] text-[#0a0f1e]' : 'text-slate-400 hover:text-white'}`}>Weekly</button>
            <button onClick={() => setTimeframe('Monthly')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeframe === 'Monthly' ? 'bg-[#00d4aa] text-[#0a0f1e]' : 'text-slate-400 hover:text-white'}`}>Monthly</button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeframe === 'Weekly' ? weeklyData : monthlyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#00d4aa', fontFamily: 'Inter' }}
              />
              <Area type="monotone" dataKey="count" stroke="#00d4aa" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Donut Chart: Revenue By Dept */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:col-span-4 flex flex-col min-h-[360px] backdrop-blur-xl"
      >
        <div className="mb-2">
          <h3 className="text-lg font-bold text-white mb-1">Dept. Load</h3>
          <p className="text-xs text-slate-500">Patient distribution by specialty</p>
        </div>
        <div className="flex-1 relative flex flex-col items-center justify-center -mt-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={50}
                  outerRadius={70}
                  stroke="rgba(255,255,255,0.05)"
                  paddingAngle={0}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 15, 30, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontFamily: 'Inter' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Center Text */}
            <div className="absolute top-[80px] flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-sans text-white">84%</span>
              <span className="text-[10px] text-slate-500 uppercase">Capacity</span>
            </div>
        </div>
        
        {/* Custom Legend */}
        <div className="flex flex-col gap-3 mt-auto px-2">
          {revenueData.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs text-slate-300">{item.name}</span>
              </div>
              <span className="font-bold text-xs text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
