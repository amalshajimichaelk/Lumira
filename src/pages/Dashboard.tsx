import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, Clock, Wallet, HeartPulse, ShieldAlert } from 'lucide-react';
import { KpiCard } from '../components/shared/KpiCard';
import { dashboardService } from '../services/api';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardService.getSummary,
  });

  if (isLoading) {
    return <div className="animate-pulse flex gap-4 p-8 text-white">Loading dashboard metrics...</div>;
  }

  if (isError || !summary) {
    return <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">Failed to load dashboard data. Ensure backend is running.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Overview</h2>
          <p className="text-slate-400 mt-1">Real-time facility metrics & operational status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Patients Today" value={summary.patientsToday?.value || 0} icon={Users} trend={summary.patientsToday?.trend} isPositive={summary.patientsToday?.isPositive} />
        <KpiCard title="Top Department" value={summary.topDept?.name || 'N/A'} icon={Activity} subtitle={summary.topDept?.value + ' patients'} />
        <KpiCard title="Avg Wait Time" value={(summary.avgWaitTime?.value || 0) + ' min'} icon={Clock} trend={summary.avgWaitTime?.trend} isPositive={summary.avgWaitTime?.isPositive} />
        <KpiCard title="Revenue (MTD)" value={summary.revenueMtd?.value || '$0'} icon={Wallet} trend={summary.revenueMtd?.trend} isPositive={summary.revenueMtd?.isPositive} />
      </div>

      <DashboardCharts />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" /> Active Treatments
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Patient</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Time</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 font-medium text-white">James Wilson</td>
                <td className="px-6 py-3 text-slate-400">Cardiology</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-400">09:15 AM</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">COMPLETED</span></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 font-medium text-white">Sarah Connor</td>
                <td className="px-6 py-3 text-slate-400">Neurology</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-400">10:30 AM</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">IN PROGRESS</span></td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 font-medium text-white">Robert Ford</td>
                <td className="px-6 py-3 text-slate-400">General</td>
                <td className="px-6 py-3 font-mono text-xs text-slate-400">11:00 AM</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] font-bold">WAITING</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
