/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Trophy, Star, Sparkles, Flame, CheckCircle, ShieldAlert, BadgeInfo } from 'lucide-react';
import { User, JobCard } from '../types';

export function PerformanceRankings({ onSelectEmployee }: { onSelectEmployee?: (emp: any) => void }) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const [empRes, tskRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/tasks')
      ]);

      if (empRes.ok && tskRes.ok) {
        setEmployees(await empRes.json());
        setTasks(await tskRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats helper
  const topPerformers = [...employees]
    .filter(u => u.role === 'EMPLOYEE')
    .sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0));

  const employeeOfTheMonth = topPerformers[0];
  const settingSpecialist = topPerformers.find(e => e.department === 'Setting') || topPerformers[1];
  const polishingSpecialist = topPerformers.find(e => e.department === 'Polishing') || topPerformers[2];

  // Jewelry categorization count
  const ringCount = tasks.filter(t => t.jewelryType === 'Ring').length;
  const necklaceCount = tasks.filter(t => t.jewelryType === 'Necklace').length;
  const braceletCount = tasks.filter(t => t.jewelryType === 'Bracelet').length;
  const earringsCount = tasks.filter(t => t.jewelryType === 'Earrings').length;
  const customCount = tasks.filter(t => t.jewelryType === 'Custom Jewelry' || t.jewelryType === 'Pendant').length;

  const totalTypesCount = ringCount + necklaceCount + braceletCount + earringsCount + customCount || 1;

  // Compute QC metrics
  const completedJobs = tasks.filter(t => t.status === 'Completed');
  const reworkJobs = tasks.filter(t => t.status === 'Rework');
  const totalQCReviewed = completedJobs.length + reworkJobs.length || 1;
  const rejectionRate = Math.round((reworkJobs.length / totalQCReviewed) * 100);

  return (
    <div id="performance-rankings-module" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            ENTERPRISE ANALYTICS & PRODUCTIVITY BOARD
          </h2>
          <p className="text-xs text-gray-400">
            Realtime factory yield rate, defect ratios, material allocations, and elite craftsmen rankings.
          </p>
        </div>
      </div>

      {/* Specialty Badges Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee of the Month */}
        <div className="relative p-6 bg-gradient-to-br from-[#121214] via-[#1a1a1c] to-[#252528] border border-[#d4af37]/30 rounded-2xl flex items-center gap-4.5 overflow-hidden shadow-[0_4px_30px_rgba(212,175,55,0.05)]">
          <div className="absolute top-0 right-0 p-1 bg-[#d4af37] text-black text-[9px] font-extrabold uppercase tracking-widest rounded-bl-xl origin-top-right">
            ELITE APEX
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#aa7c11] rounded-2xl flex items-center justify-center text-black shrink-0 relative">
            <Trophy className="w-7 h-7" />
            <span className="absolute -bottom-1 -right-1 bg-black text-[#d4af37] text-[9px] font-mono px-1 rounded border border-[#d4af37]">#1</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-extrabold block">EMPLOYEE OF THE MONTH</span>
            <h3 className="text-base font-bold text-white mt-0.5">{employeeOfTheMonth ? employeeOfTheMonth.fullName : 'Rajesh Kumar'}</h3>
            <p className="text-xs text-gray-400">Yield Rank: <b className="text-[#f3e5ab]">{employeeOfTheMonth ? employeeOfTheMonth.productivityScore : 98}% Score</b></p>
          </div>
        </div>

        {/* Best Ring Setting Specialist */}
        <div className="relative p-6 bg-[#121214] border border-gray-800 rounded-2xl flex items-center gap-4.5 overflow-hidden shadow-xl">
          <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-[#d4af37] shrink-0">
            <Star className="w-7 h-7 fill-[#d4af37]/20" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">BEST RING SPECIALIST</span>
            <h3 className="text-base font-bold text-white mt-0.5">{settingSpecialist ? settingSpecialist.fullName : 'Deepa Patel'}</h3>
            <p className="text-xs text-gray-400">Pinnacle setting technique.</p>
          </div>
        </div>

        {/* Fastest Gold Polisher */}
        <div className="relative p-6 bg-[#121214] border border-gray-800 rounded-2xl flex items-center gap-4.5 overflow-hidden shadow-xl">
          <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-[#d4af37] shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">FASTEST WORKER YIELD</span>
            <h3 className="text-base font-bold text-white mt-0.5">{polishingSpecialist ? polishingSpecialist.fullName : 'Vikram Rathore'}</h3>
            <p className="text-xs text-gray-400">Zero timeline delays recorded.</p>
          </div>
        </div>
      </div>

      {/* Visual Custom Dashboard and Interactive Analytical Yield charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance rankings list table */}
        <div className="lg:col-span-2 bg-[#121214]/95 border border-gray-800 rounded-2xl p-6">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
            CRAFT RANKINGS & QUALITY CERTIFICATE SCOREBOARD
          </span>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {topPerformers.map((emp, index) => {
              const place = index + 1;
              return (
                <div 
                  key={emp.id} 
                  onClick={() => onSelectEmployee?.(emp)}
                  data-hover-employee-id={emp.id}
                  className="p-3.5 bg-[#161618] border border-gray-800 rounded-xl flex items-center justify-between hover:border-[#d4af37]/40 hover:bg-gray-800/10 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border ${
                      place === 1 ? 'bg-[#d4af37] text-black border-[#aa7c11]' :
                      place === 2 ? 'bg-gray-400 text-black border-gray-300' :
                      place === 3 ? 'bg-amber-700 text-white border-amber-800' :
                      'bg-gray-900 text-gray-400 border-gray-800'
                    }`}>
                      {place}
                    </span>

                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-white">{emp.fullName}</h4>
                      <p className="text-xs text-gray-400">{emp.department} • <span className="italic text-gray-500">{emp.specialization || 'Assembly'}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 p-1 px-2.5 rounded-lg text-xs font-semibold">
                      {emp.skillLevel}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase block">Yield RATIO</span>
                      <span className="font-mono text-sm font-extrabold text-[#f3e5ab]">{emp.productivityScore || 85}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom luxury SVG Graph Yield meters and charts */}
        <div className="space-y-6">
          {/* Jewelry Category Allocation Yield Chart */}
          <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
              JEWELS ALLOCATION CATEGORIES
            </span>

            {/* Premium custom SVG horizontal bar graph with gold accents */}
            <div className="space-y-4">
              {[
                { name: 'Rings', count: ringCount, color: '#d4af37' },
                { name: 'Necklaces', count: necklaceCount, color: '#f3e5ab' },
                { name: 'Bracelets', count: braceletCount, color: '#c5a059' },
                { name: 'Earrings', count: earringsCount, color: '#a08040' },
                { name: 'Custom jobs', count: customCount, color: '#7a602a' }
              ].map((cat) => {
                const percent = Math.round((cat.count / totalTypesCount) * 100) || 5;
                return (
                  <div key={cat.name} className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{cat.name}</span>
                      <span className="font-mono text-white font-bold">{cat.count} Units ({percent}%)</span>
                    </div>
                    {/* Visual bar container */}
                    <div className="w-full bg-[#18181a] h-2 rounded-full overflow-hidden border border-gray-800/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                          backgroundImage: `linear-gradient(to right, ${cat.color}, #aa7c11)`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality rate indicators meters */}
          <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
              QUALITY SIGMA CONTROLS
            </span>

            <div className="flex justify-around items-center py-2">
              <div className="text-center relative">
                {/* SVG Progress Ring */}
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-gray-800" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-[#d4af37]"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - (100 - rejectionRate) / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-sm font-mono font-bold text-white">{100 - rejectionRate}%</span>
                  <span className="text-[8px] text-emerald-400 uppercase tracking-tight">Pass Rate</span>
                </div>
              </div>

              <div className="text-left space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">QC SUCCESSFUL</span>
                    <b className="text-white">{completedJobs.length} Jobs cleared</b>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">QC RETURNED</span>
                    <b className="text-white">{reworkJobs.length} Rework cases</b>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed text-center">
              Rejection rate calibrated dynamically checks total rework loops against approved customer shipments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
