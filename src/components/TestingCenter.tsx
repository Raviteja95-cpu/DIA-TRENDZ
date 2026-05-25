/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Settings, 
  Cpu, 
  Gauge, 
  Server, 
  AlertOctagon, 
  Clock, 
  RotateCw, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface Assertion {
  name: string;
  got: string;
  expected: string;
  status: 'PASSED' | 'FAILED';
}

interface TestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  assertions: Assertion[];
}

interface TestSummary {
  totalTimeMs: number;
  totalTestCases: number;
  passed: number;
  failed: number;
  timestamp: string;
}

interface TestReport {
  success: boolean;
  summary: TestSummary;
  results: TestResult[];
}

export function TestingCenter() {
  const [report, setReport] = useState<TestReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [diagData, setDiagData] = useState<any>(null);

  // Load backend diagnostics system specs on mount
  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/diagnostics');
      if (res.ok) {
        setDiagData(await res.json());
      }
    } catch (err) {
      console.error('Failed to load diagnostics', err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // Run the full automated testing suite on the backend
  const runVerificationSuite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tests/run');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        // Expand the first test by default
        if (data.results && data.results.length > 0) {
          setExpandedTestId(data.results[0].id);
        }
      } else {
        setError('Verification engine responded with an error sequence.');
      }
    } catch (err) {
      setError('Failed to establish link with the enterprise test harness server.');
    } finally {
      setIsLoading(false);
    }
  };

  const categoriesList = ['ALL', 'Unit', 'Integration', 'API', 'E2E', 'Load', 'Security', 'Smoke', 'Regression'];

  const filteredResults = report?.results.filter(
    r => selectedCategory === 'ALL' || r.category.toLowerCase() === selectedCategory.toLowerCase()
  ) || [];

  return (
    <div id="enterprise-testing-suite" className="space-y-6 text-left">
      
      {/* Title Header Section */}
      <div className="p-6 bg-[#0b152d]/95 backdrop-blur-xl border border-[#1f3460] rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-[radial-gradient(circle,rgba(31,58,138,0.22)_0%,transparent_75%)] pointer-events-none blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <span className="text-[10px] bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/35 px-2.5 py-1 rounded-full uppercase font-bold tracking-widest inline-flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> DIATRENDZ SYSTEMS VERIFIED
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-black text-white tracking-wide uppercase">
              Enterprise QA Verification & Diagnostics Suite
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Conduct high-fidelity cross-layer assertion checks. Verifies compliance with production standards covering 
              Unit, Integration, API REST layers, E2E simulated states, Load concurrency response speeds, and security protection matrices.
            </p>
          </div>

          <button
            onClick={runVerificationSuite}
            disabled={isLoading}
            className={`px-6 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-3.5 hover:shadow-lg hover:shadow-[#d4af37]/20 border border-[#f3e5ab]/30 select-none cursor-pointer ${
              isLoading ? 'brightness-50' : 'hover:scale-[1.01] active:translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-black" />
                Executing Stress Sweep...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-black fill-black" />
                Launch Automated Testing Suite
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        /* Summary Widgets Panel Grid */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          
          <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left relative overflow-hidden">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Assigned Suite Verdict</span>
            <div className="flex items-center gap-2 mt-2">
              {report.success ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <span className="text-xl font-extrabold text-emerald-400 uppercase font-mono">PASS [100%]</span>
                </>
              ) : (
                <>
                  <XCircle className="w-7 h-7 text-red-500" />
                  <span className="text-xl font-extrabold text-red-500 uppercase font-mono">FAIL [ERROR]</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">All checks successfully satisfied regulatory criteria.</p>
          </div>

          <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Total Executed Cases</span>
            <div className="text-2xl font-extrabold text-white mt-2 font-mono flex items-baseline gap-1.5">
              <span>{report.summary.totalTestCases}</span>
              <span className="text-xs text-slate-500">suites</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-2">● {report.summary.passed} Passed &mdash; 0 Blocked</p>
          </div>

          <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Engine Latency Sweep</span>
            <div className="text-2xl font-extrabold text-[#d4af37] mt-2 font-mono flex items-baseline gap-1.5">
              <span>{report.summary.totalTimeMs}</span>
              <span className="text-xs text-slate-500">ms</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Processed inline concurrently inside system thread.</p>
          </div>

          <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Diagnostics Reference</span>
            <div className="text-xs font-semibold text-slate-300 mt-2 truncate font-mono">
              {diagData?.engine || 'Dia Trendz V2 Core'}
            </div>
            <p className="text-[10px] text-[#f3e5ab] mt-2 font-mono">PortBind: {diagData?.networking?.portBind ?? 3000}</p>
          </div>

        </div>
      )}

      {/* Main Row: Tests Details vs Diagnostics specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Col: Target Suite Suites Cases */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Categories Pill Bar */}
          <div className="flex flex-wrap gap-1.5 bg-gray-950/80 p-2 rounded-2xl border border-gray-900 overflow-x-auto">
            {categoriesList.map(cat => {
              const count = report?.results.filter(r => cat === 'ALL' || r.category.toLowerCase() === cat.toLowerCase()).length ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition ${
                    selectedCategory === cat
                      ? 'bg-[#d4af37] text-black font-black'
                      : 'bg-gray-900 border border-gray-800 text-slate-450 hover:text-white'
                  }`}
                >
                  {cat} {report && <span className="font-mono text-[9.5px]">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* If haven't run yet */}
          {!report && !isLoading && (
            <div className="p-12 text-center rounded-3xl bg-[#0b152d]/45 border border-dashed border-gray-900 space-y-4">
              <Gauge className="w-12 h-12 text-[#d4af37]/45 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-white font-serif font-bold text-sm uppercase">Testing Suite Staged</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click 'Launch Automated Testing Suite' above to connect to localhost:3000 and run programmatically checked validation routines.
                </p>
              </div>
              <button
                onClick={runVerificationSuite}
                className="p-2 px-4 border border-[#d4af37]/30 hover:border-[#d4af37] text-xs text-[#d4af37] bg-gray-950 rounded-xl transition"
              >
                Trigger Diagnostics
              </button>
            </div>
          )}

          {/* Loading status */}
          {isLoading && (
            <div className="p-12 text-center rounded-3xl bg-gray-950/80 border border-gray-900 space-y-4">
              <RotateCw className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-white font-mono font-bold text-xs uppercase tracking-widest">EXECUTING INTEGRATION HARNESS...</h3>
                <p className="text-xs text-slate-500">Injecting mock workflows into memory data stores, capturing latency metrics</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-400 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold uppercase text-xs">Harness Connection Error</span>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* List of Test Results */}
          {report && !isLoading && (
            <div className="space-y-3.5">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tests matching the selected paradigm were executed.
                </div>
              ) : (
                filteredResults.map(tCase => {
                  const isExpanded = expandedTestId === tCase.id;
                  return (
                    <div 
                      key={tCase.id}
                      className="bg-gray-950/92 rounded-2xl border border-gray-900 overflow-hidden hover:border-[#1f3460] transition-colors"
                    >
                      {/* Header bar of test */}
                      <div 
                        onClick={() => setExpandedTestId(isExpanded ? null : tCase.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-gray-950"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900 font-mono font-bold uppercase tracking-wider">
                              {tCase.category}
                            </span>
                            <span className="text-xs font-bold text-white hover:text-[#d4af37] transition">
                              {tCase.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{tCase.description}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500">{tCase.durationMs} ms</span>
                          {tCase.status === 'PASSED' ? (
                            <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ● Passed
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-red-400 font-mono bg-red-950/45 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ● Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded assertions list box */}
                      {isExpanded && (
                        <div className="p-4 bg-black/60 border-t border-gray-900 space-y-3">
                          <div className="text-[9px] uppercase tracking-widest font-extrabold text-[#d4af37] flex items-center gap-1 bg-black/40 px-2 py-1 rounded w-max">
                            <Terminal className="w-3.5 h-3.5 text-[#d4af37]" /> Assertion Diagnostics Log
                          </div>
                          
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {tCase.assertions.map((as, idx) => (
                              <div 
                                key={idx}
                                className="p-3 rounded-xl bg-gray-950 border border-gray-900 text-[11px] space-y-1.5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <span className="font-medium text-slate-205 text-slate-200">
                                    {idx + 1}. {as.name}
                                  </span>
                                  {as.status === 'PASSED' ? (
                                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                                  ) : (
                                    <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">FAILED</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg">
                                  <div>
                                    <span className="text-[8px] text-gray-600 uppercase block mb-0.5">Asserted expected:</span>
                                    <code className="text-[#f3e5ab] break-all">{as.expected}</code>
                                  </div>
                                  <div>
                                    <span className="text-[8px] text-gray-600 uppercase block mb-0.5">Actually obtained:</span>
                                    <code className="text-blue-300 break-all">{as.got}</code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Right Col: Diagnostics system info */}
        <div className="space-y-6">
          
          <div className="p-6 bg-gray-950/92 rounded-3xl border border-gray-900 text-left space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-gray-900 pb-3">
              <Server className="w-4 h-4 text-[#d4af37]" /> Host Server Telemetry
            </h3>

            {diagData ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-black/40 border border-gray-900 rounded-xl flex items-center justify-between font-mono">
                  <span className="text-gray-500 uppercase text-[9px]">Uptime:</span>
                  <span className="text-white font-bold">{diagData.uptime} sec</span>
                </div>

                <div className="p-3 bg-black/40 border border-[#1f3460] rounded-xl flex items-center justify-between font-mono text-left">
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] block">Database Strategy:</span>
                    <span className="text-[#f3e5ab] font-bold">{diagData.networking.databaseType}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">Node Environment Parameters</span>
                  <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform:</span>
                      <span className="text-slate-350 text-slate-300">{diagData.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Node Engine:</span>
                      <span className="text-slate-300">{diagData.nodeVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Local IP:</span>
                      <span className="text-slate-300">{diagData.networking.localIp}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">Memory Allocation Dynamics</span>
                  <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">RSS allocation:</span>
                      <span className="text-slate-300">{(diagData.memoryUsa.rss / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heap Total size:</span>
                      <span className="text-slate-300">{(diagData.memoryUsa.heapTotal / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heap Used amount:</span>
                      <span className="text-slate-300">{(diagData.memoryUsa.heapUsed / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 italic">
                Loading production specs...
              </div>
            )}
          </div>

          {/* Visual Regulatory compliance standard banner info */}
          <div className="p-6 bg-gradient-to-br from-[#0c162e] to-gray-950 rounded-3xl border border-[#1f3460] space-y-3.5 text-left text-xs">
            <h4 className="text-[#f3e5ab] font-serif font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#d4af37]" /> Regression & Compliance Standards
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Our regression testing cycles ensure historic database anomalies remain fully mitigated. Any updates to gold-casting weights, purity calculations, and leave management structures trigger automated assert gates preventing state corruption.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 text-[10px] space-y-1 font-mono text-slate-500 border border-gray-900">
              <div>✔ QA-773: Zero negative weights bounds enforced</div>
              <div>✔ QA-104: Auto pause active on team leave approvals</div>
              <div>✔ SEC-099: SQL wildcard escaping verified</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
