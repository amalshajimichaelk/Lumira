import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Activity, Clock, ShieldPlus } from 'lucide-react';
import { dataService } from '../services/api';
import { motion } from 'framer-motion';

export default function Doctors() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: doctorsList, isLoading } = useQuery({ queryKey: ['allDoctors'], queryFn: dataService.getAllDoctors });
  const { data: workload } = useQuery({ queryKey: ['doctorWorkload'], queryFn: dataService.getDoctors });

  if (isLoading) return <div className="text-white">Loading...</div>;

  const mergedDoctors = doctorsList?.map((doc: any) => {
    const w = workload?.find((wk: any) => wk.doctorId === doc.id);
    return { ...doc, workloadPercent: w?.workloadPercent || 0, maxCapacity: w?.maxCapacity || 20 };
  }) || [];

  const filteredDoctors = mergedDoctors.filter((d: any) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><ShieldPlus className="w-8 h-8 text-primary" /> Physician Directory</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input type="text" placeholder="Search doctors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-primary/50 text-white" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Physician</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Appointments Today</th>
                <th className="px-6 py-4 font-semibold">Current Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDoctors.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{doc.name}</td>
                  <td className="px-6 py-4 text-slate-300">{doc.department.name}</td>
                  <td className="px-6 py-4 text-slate-300 font-mono">{doc.appointmentsToday} / {doc.maxCapacity}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: Math.min(doc.workloadPercent, 100) + '%' }} />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-8">{doc.workloadPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}