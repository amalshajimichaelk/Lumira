import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { dataService } from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Departments() {
  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: dataService.getDepartmentPerformance });

  if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Activity className="w-8 h-8 text-primary" /> Department Performance</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[400px] flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4 shrink-0">Patient Throughput</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20, bottom: 5, top: 0 }}>
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="patientCount" fill="#00d4aa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}