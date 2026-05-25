/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Upload, MessageSquare, ListTodo, User } from 'lucide-react';
import { JobCard } from '../types';

interface QCModuleProps {
  currentUser: any;
  onRefreshMetrics?: () => void;
  onSelectEmployee?: (empOrId: any) => void;
}

export function QCModule({ currentUser, onRefreshMetrics, onSelectEmployee }: QCModuleProps) {
  const [qcPendingJobs, setQcPendingJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for active job select
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [remarks, setRemarks] = useState('');
  const [defects, setDefects] = useState('');
  const [reworkHours, setReworkHours] = useState(2);
  const [imageUpload, setImageUpload] = useState<string>(''); // base64 string
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchQCPending();
  }, []);

  const fetchQCPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        const pending = data.filter((t: JobCard) => t.status === 'QC Pending' || t.status === 'Rework');
        setQcPendingJobs(pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQCAction = async (action: 'approve' | 'reject') => {
    if (!selectedJob) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // If there is an image uploaded, attach it first to the task
      if (imageUpload) {
        await fetch('/api/tasks/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: selectedJob.id,
            imageBase64: imageUpload,
            userId: currentUser.id,
            userName: currentUser.fullName,
            userRole: currentUser.role
          })
        });
      }

      // Perform standard QC workflow action and save
      const res = await fetch('/api/tasks/qc-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedJob.id,
          action: action === 'approve' ? 'approve' : 'reject',
          remarks: remarks.trim(),
          defects: defects.trim(),
          reworkHours,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (!res.ok) {
        let errMsg = 'Verification execution failed.';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const err = await res.json();
            errMsg = err.message || errMsg;
          } else {
            const txt = await res.text();
            errMsg = txt || `HTTP Error ${res.status}: ${res.statusText}`;
          }
        } catch (parseErr) {
          errMsg = `HTTP System Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errMsg);
      }

      setSuccessMsg(`Quality inspection completed. Product is now marked: ${action === 'approve' ? 'Approved & Shipped' : 'Rework Recalled'}`);
      setSelectedJob(null);
      setRemarks('');
      setDefects('');
      setReworkHours(2);
      setImageUpload('');
      fetchQCPending();
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err: any) {
      setErrorMsg(err.message || 'Request failure');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="quality-control-module" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            QUALITY CONTROL & INWARD CHECKING
          </h2>
          <p className="text-xs text-gray-400">
            Audit finished gold/diamond jewelry work artifacts, sign-off compliance certificates or return for workbench rework.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-semibold animate-bounce duration-500">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-semibold">
          ✕ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Products List Panel */}
        <div className="lg:col-span-2 bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-2">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#d4af37]" /> Active QC Verification Queue
            </span>
            <span className="px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-400 text-[10px] rounded-lg">
              Queue Total: {qcPendingJobs.length} Items
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 text-xs animate-pulse">Scanning production pipeline...</div>
          ) : qcPendingJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs space-y-1">
              <CheckCircle2 className="w-10 h-10 text-gray-700 mx-auto" />
              <p className="font-semibold text-gray-400">All products successfully inspected!</p>
              <p className="text-[10px] opacity-70">No jewelry items awaiting QC clearance at this time.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {qcPendingJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setRemarks(job.qcRemarks || '');
                    setDefects(job.qcDefects || '');
                    setReworkHours(job.reworkHours || 2);
                    setImageUpload('');
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    selectedJob?.id === job.id
                      ? 'bg-[#d4af37]/5 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                      : 'bg-[#18181a] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4af37]">{job.id}</span>
                      <h4 className="text-sm font-serif font-bold text-white text-left">{job.jewelryType} - {job.customerName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      job.status === 'Rework' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-400 font-mono mt-3 pt-2 border-t border-gray-800/50">
                    <div>Metal: <span className="text-gray-200">{job.materialType}</span></div>
                    <div>Purity wt: <span className="text-gray-200">{job.goldWeight} g</span></div>
                    <div>Complexity: <span className="text-gray-200">{job.complexityLevel}</span></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 font-sans">
                    <span 
                      onClick={() => onSelectEmployee?.(job.assignedEmployeeId)}
                      data-hover-employee-id={job.assignedEmployeeId}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-[#d4af37] transition duration-150 inline-flex"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" /> Specialist: <b className="text-[#f3e5ab] underline underline-offset-2">{job.assignedEmployeeName}</b>
                    </span>
                    <span className="text-[10px] text-gray-500">Work time: <b>{job.actualTime} hours</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
            Inspection Sign-off Controls
          </span>

          {selectedJob ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-mono">SELECTED WORK ITEM</span>
                <p className="text-sm font-bold text-white uppercase">{selectedJob.id} — {selectedJob.customerName}</p>
                <div className="text-[11px] text-gray-400">{selectedJob.jewelryType} ({selectedJob.materialType})</div>
              </div>

              {/* Remarks Area */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-gray-400 tracking-wider uppercase font-bold">Inward QC Inspection Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#1a1a1c] border border-gray-800 rounded-xl text-xs p-3 text-gray-200 placeholder-gray-600 focus:outline-[#d4af37]/60"
                  rows={3}
                  placeholder="Detail diamond alignments, metal finish specs, prong checks, high micro-pave polishing validation..."
                />
              </div>

              {/* Image upload area */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-gray-400 tracking-wider uppercase font-bold">Attach inspection proof</label>
                <div className="border border-dashed border-gray-800 rounded-xl p-4 bg-[#161618] hover:bg-[#1a1a1c] text-center cursor-pointer transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imageUpload ? (
                    <div className="space-y-2">
                      <div className="w-full h-24 bg-contain bg-center bg-no-repeat rounded bg-black/50" style={{ backgroundImage: `url(${imageUpload})` }} />
                      <span className="text-[10px] text-emerald-400 font-bold block">✓ Custom Reference Frame Staged</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 mx-auto text-[#d4af37]" />
                      <span className="text-[10px] text-gray-400 block">Upload macro certificate frame or defect image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rework controls */}
              <div className="p-4 bg-orange-950/10 border border-orange-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300 uppercase">Defect Registry (If returning for Rework)</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={defects}
                    onChange={(e) => setDefects(e.target.value)}
                    className="w-full bg-[#1e1e20] border border-gray-800 rounded-lg text-xs p-2.5 text-orange-200 placeholder-amber-900/40 focus:outline-none"
                    rows={2}
                    placeholder="Describe casting porosity, asymmetrical settings, weak solder points..."
                  />

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase mb-1">Estimated rework hours allocation</label>
                    <input
                      type="number"
                      value={reworkHours}
                      onChange={(e) => setReworkHours(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-[#1e1e20] border border-gray-800 rounded-lg text-xs p-2 text-white font-mono"
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => handleQCAction('reject')}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-xs rounded-xl hover:brightness-115 transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject (Rework)
                </button>

                <button
                  onClick={() => handleQCAction('approve')}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs rounded-xl hover:brightness-115 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Ship
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-700" />
              <p className="text-xs font-semibold">No active selection</p>
              <p className="text-[10px] opacity-70">Pick any pending production jewel item from the queue list to perform QA reviews.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
