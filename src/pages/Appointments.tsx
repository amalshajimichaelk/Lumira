import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Search, User, Clock, UserRound } from 'lucide-react';
import { dataService } from '../services/api';
import { motion } from 'framer-motion';

export default function Appointments() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['appointments', page], queryFn: () => dataService.getAppointments({ page, limit: 15 }) });

  if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Calendar className="w-8 h-8 text-primary" /> Schedule Management</h2>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Physician</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.data?.map((app: any) => (
                <tr key={app.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{app.patient.name}</td>
                  <td className="px-6 py-4 text-slate-300">{new Date(app.scheduledAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-300">{app.doctor.name}</td>
                  <td className="px-6 py-4 text-slate-400">{app.department.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-primary/20 text-primary bg-primary/10">
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <div className="text-sm text-slate-400">
            Showing page {data?.pagination?.page || 1} of {data?.pagination?.totalPages || 1}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-4 py-2 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= (data?.pagination?.totalPages || 1)}
              className="px-4 py-2 text-sm font-semibold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}