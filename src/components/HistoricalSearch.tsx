/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Calendar, User, SlidersHorizontal, Eye, ShieldAlert, Award, FileText } from 'lucide-react';
import { JobCard, User as UserType } from '../types';

interface HistoricalSearchProps {
  currentUser: any;
  onSelectEmployee?: (empOrId: any) => void;
}

export function HistoricalSearch({ currentUser, onSelectEmployee }: HistoricalSearchProps) {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [searchResults, setSearchResults] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [jewelryType, setJewelryType] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected job for deep view modal
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);

  useEffect(() => {
    fetchEmployees();
    executeSearch();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data.filter((u: any) => u.role === 'EMPLOYEE'));
    } catch (err) {
      console.error('Error fetching search employees', err);
    }
  };

  const executeSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (jewelryType) params.append('jewelryType', jewelryType);
      if (employeeId) params.append('employeeId', employeeId);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Search query failure', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setJewelryType('');
    setEmployeeId('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      executeSearch();
    }, 50);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35';
      case 'Waiting Approval': return 'bg-amber-500/15 text-amber-400 border-amber-500/35';
      case 'In Progress': return 'bg-blue-500/15 text-blue-400 border-blue-500/35';
      case 'Paused': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/35';
      case 'Switched': return 'bg-purple-500/15 text-purple-400 border-purple-500/35';
      case 'QC Pending': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35';
      case 'Rework': return 'bg-orange-500/15 text-orange-400 border-orange-500/35';
      case 'Cancelled': return 'bg-rose-500/15 text-rose-400 border-rose-500/35';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div id="historical-search-module" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            HISTORICAL PRODUCTION REGISTRY
          </h2>
          <p className="text-xs text-gray-400">
            Deep search system index containing records, audit logs, and timelines.
          </p>
        </div>
      </div>

      {/* Modern High-Density Filter Grid */}
      <div className="p-6 bg-[#121214]/90 border border-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
          <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs font-bold text-[#f3e5ab] uppercase tracking-wider">Historical Index Search Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Text Query (ID / Cust / Name)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search job id, employee, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs font-sans text-gray-200 focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Jewelry Class</label>
            <select
              value={jewelryType}
              onChange={(e) => setJewelryType(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs p-2 text-gray-300 focus:outline-[#d4af37]/60"
            >
              <option value="">-- All Types --</option>
              <option value="Ring">Ring</option>
              <option value="Necklace">Necklace</option>
              <option value="Bracelet">Bracelet</option>
              <option value="Earrings">Earrings</option>
              <option value="Pendant">Pendant</option>
              <option value="Custom Jewelry">Custom Jewelry</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Assigned Personnel</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs p-2 text-gray-300 focus:outline-[#d4af37]/60"
            >
              <option value="">-- All Workers --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Task status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs p-2 text-gray-300 focus:outline-[#d4af37]/60"
            >
              <option value="">-- All Statuses --</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Waiting Approval">Waiting Approval</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Paused">Paused</option>
              <option value="QC Pending">QC Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rework">Rework</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={executeSearch}
              className="flex-1 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-xs rounded-lg hover:brightness-110 flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Filter
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800/60">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Due Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs p-2 text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Due End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-gray-800 rounded-lg text-xs p-2 text-gray-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="bg-[#121214]/90 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#161618] border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Registry Records ({searchResults.length})</span>
          {loading && <div className="text-xs text-[#d4af37] animate-pulse">Scanning server repository...</div>}
        </div>

        {searchResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto text-gray-700 mb-2" />
            <p className="text-xs font-semibold">No records match the active database queries specified.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1a1a1c] text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3">IDS</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Product Config</th>
                  <th className="px-6 py-3">Personnel</th>
                  <th className="px-6 py-3">Est/App/Act</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {searchResults.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono">
                      <div className="text-[#f3e5ab] font-bold">{job.id}</div>
                      <div className="text-[10px] text-gray-500">{job.taskId}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {job.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-medium">{job.jewelryType}</span>
                        <span className="text-[10px] text-gray-500">[{job.materialType}]</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Complexity: {job.complexityLevel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        onClick={() => onSelectEmployee?.(job.assignedEmployeeId)}
                        data-hover-employee-id={job.assignedEmployeeId}
                        className="flex items-center gap-1.5 text-gray-300 hover:text-[#d4af37] transition cursor-pointer font-bold duration-150 inline-flex"
                      >
                        <User className="w-3.5 h-3.5 text-gray-400" /> {job.assignedEmployeeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px]">
                      <div>Est: <span className="text-amber-400">{job.estimatedTime}h</span></div>
                      <div>App: <span className="text-emerald-400">{job.approvedTime}h</span></div>
                      <div>Act: <span className="text-blue-400">{job.actualTime}h</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-1 px-2.5 bg-gray-800/80 hover:bg-[#d4af37]/20 border border-gray-700 hover:border-[#d4af37]/45 text-gray-300 hover:text-white rounded text-[10px] transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Audit Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Job Audit Timeline Drawer Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#121214] border border-[#d4af37]/35 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#18181a] border-b border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#d4af37] font-bold">SYSTEM TIMELINE REPORT</span>
                <h3 className="text-lg font-serif font-bold text-white uppercase">{selectedJob.id} [ {selectedJob.customerName} ]</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-white text-sm bg-gray-800 rounded-full w-7 h-7 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase">Jewel Class</div>
                  <div className="text-sm font-bold text-[#f3e5ab]">{selectedJob.jewelryType}</div>
                </div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase">Weight / Metal</div>
                  <div className="text-sm font-bold text-gray-200">{selectedJob.goldWeight}g • {selectedJob.materialType}</div>
                </div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase">Complexity</div>
                  <div className="text-sm font-bold text-gray-200">{selectedJob.complexityLevel}</div>
                </div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase">Status</div>
                  <div className="text-xs font-semibold text-emerald-400 uppercase mt-0.5">{selectedJob.status}</div>
                </div>
              </div>

              {/* Progress Panel */}
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-gray-400 font-bold">
                  <span>PRODUCTION TIMELINE RATIO</span>
                  <span>{selectedJob.progressPercent}% COMPLETE</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#d4af37] to-[#aa7c11] h-full"
                    style={{ width: `${selectedJob.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Event Timeline Trace Logs */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" /> HISTORICAL TIMELINE TRAIL
                </h4>

                <div className="relative border-l-2 border-gray-800 pl-4 ml-2.5 space-y-5 py-2">
                  {selectedJob.timeline && selectedJob.timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[25px] top-1 bg-gray-950 border-2 border-[#d4af37] w-3 h-3 rounded-full" />
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                        <div>
                          <span className="text-xs font-bold text-white">{evt.status}</span>
                          {evt.payload && (
                            <span className="ml-2 text-[11px] bg-amber-950/40 border border-[#d4af37]/30 px-1.5 py-0.5 rounded text-amber-200 font-mono">
                              {evt.payload}
                            </span>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5 italic">By: {evt.user}</p>
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interruption Pause Logs */}
              {selectedJob.interruptionLogs && selectedJob.interruptionLogs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-red-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> INTERRUPTION & SWITCH LOGS
                  </h4>
                  <div className="space-y-2">
                    {selectedJob.interruptionLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-red-950/10 border border-red-900/40 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-red-400">Task Switch Interruption</span>
                          <span className="text-[10px] text-gray-500">{new Date(log.pausedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-300">Reason: {log.reason}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Pause Duration Computed: {log.durationMinutes} Minutes</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Base64 Manufacturing Artifact Images */}
              {selectedJob.workImages && selectedJob.workImages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#d4af37]" /> UPLOADED PRODUCTION ARTIFACTS
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedJob.workImages.map((img, idx) => (
                      <div key={idx} className="border border-gray-800 rounded-xl overflow-hidden bg-black/40 bg-contain bg-center bg-no-repeat h-32 relative group">
                        <img src={img} alt="Production image" className="w-full h-full object-cover transition duration-300 group-hover:scale-115" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-[10px] text-white bg-black/80 p-1 px-2 rounded border border-gray-700">Production Card {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#18181a] border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
