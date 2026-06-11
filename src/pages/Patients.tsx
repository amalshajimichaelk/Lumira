import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search } from 'lucide-react';
import { dataService } from '../services/api';
import { motion } from 'framer-motion';

export default function Patients() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({ 
    queryKey: ['patients', page], 
    queryFn: () => dataService.getPatients({ page, limit: 15 }) 
  });

  if (isLoading) return <div className="text-white">Loading...</div>;

  const visits = data?.data || [];
  const filteredVisits = visits.filter((v: any) => 
    v.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.patient?.patientCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><Users className="w-8 h-8 text-primary" /> Patient Records</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-primary/50 text-white" 
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Gender</th>
                <th className="px-6 py-4 font-semibold">Last Visit</th>
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisits.map((visit: any) => (
                <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{visit.patient?.name}</td>
                  <td className="px-6 py-4 text-slate-400">{visit.patient?.patientCode}</td>
                  <td className="px-6 py-4 text-slate-400 capitalize">{visit.patient?.gender?.toLowerCase()}</td>
                  <td className="px-6 py-4 text-slate-300">{new Date(visit.visitDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-300">{visit.doctor?.name}</td>
                  <td className="px-6 py-4 text-slate-400">{visit.department?.name}</td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No patient records found.
                  </td>
                </tr>
              )}
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
