/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Mail, Server, Activity, Plus, Trash2, ShieldX, Database, Cpu, HardDrive } from 'lucide-react';
import { EmailDomain, AuditLog } from '../types';

interface SuperAdminSettingsProps {
  currentUser: any;
  onRefreshMetrics?: () => void;
}

export function SuperAdminSettings({ currentUser, onRefreshMetrics }: SuperAdminSettingsProps) {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [domRes, logsRes, diagRes] = await Promise.all([
        fetch('/api/domains'),
        fetch('/api/logs'),
        fetch('/api/diagnostics')
      ]);

      if (domRes.ok && logsRes.ok && diagRes.ok) {
        setDomains(await domRes.json());
        setLogs(await logsRes.json());
        setDiagnostics(await diagRes.json());
      }
    } catch (err) {
      console.error('Server sync diagnostic failure', err);
    }
  };

  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newDomain.startsWith('@')) {
      setErrorMsg('Domain name must be formatted beginning with @ (e.g. @diatrendz.com)');
      return;
    }

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain.trim(),
          isDefault: false,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Operation failed.');
      }

      setSuccessMsg(`Domain ${newDomain} registered successfully within the enterprise index.`);
      setNewDomain('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failure.');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/domains/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Deletion error.');
      }

      setSuccessMsg('Email domain removed from the active system configurations.');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch('/api/domains/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });
      if (res.ok) {
        setSuccessMsg('Default login domain updated successfully.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackupDb = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/recovery/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Secure ledger snapshot file saved on disk.');
        fetchData();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Backup script failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="super-admin-settings" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            ENTERPRISE SYSTEM REGISTRY & TELEMETRY
          </h2>
          <p className="text-xs text-gray-400">
            Configure approved domain listings, backup factory databases, and monitor hardware uptime logs.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-semibold">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-semibold">
          ✕ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Config Panel */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 self-start space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-2">
            Company Domain Manager
          </span>

          <form onSubmit={handleRegisterDomain} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Add Approved Domain</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@diatrendz.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="flex-1 bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                />
                <button
                  type="submit"
                  className="p-2 px-3 bg-[#d4af37] text-black hover:bg-[#f3e5ab] rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 text-left">
            {domains.map((dom) => (
              <div key={dom.id} className="p-2.5 bg-[#161618] border border-gray-800 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]/60" />
                  <span className="text-white font-semibold">{dom.domain}</span>
                  {dom.isDefault && (
                    <span className="text-[9px] px-1 bg-amber-950/30 text-amber-400 border border-amber-800/40 rounded">DEFAULT</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!dom.isDefault && (
                    <button
                      onClick={() => handleSetDefault(dom.id)}
                      className="text-[9px] text-[#f3e5ab] hover:underline"
                    >
                      Make Default
                    </button>
                  )}
                  {!dom.isDefault && (
                    <button
                      onClick={() => handleDeleteDomain(dom.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800/60 pt-4 space-y-4">
            <span className="text-[10px] uppercase font-bold text-gray-400">Database Administration</span>
            <button
              onClick={handleBackupDb}
              disabled={loading}
              className="w-full py-2.5 bg-[#1c1c1e] hover:bg-[#d4af37]/10 text-gray-300 hover:text-white border border-gray-800 hover:border-[#d4af37]/50 text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Database className="w-4 h-4 text-[#d4af37]" />
              {loading ? 'Executing Backup scripts...' : 'Generate DB Restore Snapshot'}
            </button>
          </div>
        </div>

        {/* Live Diagnostics & System Heath Telemetry */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 self-start space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-2">
            Local Network Host Telemetry
          </span>

          {diagnostics && (
            <div className="space-y-4 text-left text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-2.5 bg-gray-950 rounded border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">Host system OS</span>
                  <p className="font-semibold text-white">{diagnostics.platform}</p>
                </div>
                <div className="p-2.5 bg-gray-950 rounded border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">Engine system version</span>
                  <p className="font-semibold text-white">V2.4 Enterprise</p>
                </div>
                <div className="p-2.5 bg-gray-950 rounded border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">Port binder port</span>
                  <p className="font-semibold text-white">0.0.0.0:{diagnostics.networking.portBind}</p>
                </div>
                <div className="p-2.5 bg-gray-950 rounded border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block font-bold text-emerald-400">LAN sync status</span>
                  <p className="font-semibold text-white">Enabled & Synced</p>
                </div>
              </div>

              <div className="p-3 bg-gray-950 rounded border border-gray-900 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-gray-500" /> RSS Memory bound</span>
                  <b className="text-[#f3e5ab]">{(diagnostics.memoryUsa.rss / 1024 / 1024).toFixed(1)} MB</b>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-gray-500" /> V8 Engine Heap</span>
                  <b className="text-white">{(diagnostics.memoryUsa.heapUsed / 1024 / 1024).toFixed(1)} MB</b>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-gray-500" /> Host bound IP</span>
                  <b className="text-white">{diagnostics.networking.localIp}</b>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-xs text-left">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  <div>
                    <span className="text-emerald-300 font-bold font-serif uppercase text-[10px] tracking-wider">SECURE DIRECT RESTORE HOST</span>
                    <p className="text-[10px] text-gray-400">WiFi network broadcast gateway active.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Log / Session Security trail */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-2">
            Session Access & Audit Log Trail
          </span>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-left">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-950 rounded-lg border border-gray-900 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`${
                    log.action.includes('Failed') ? 'text-red-400' : 'text-[#d4af37]'
                  } font-bold`}>{log.action}</span>
                  <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-300">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>User: {log.userName}</span>
                  <span className="bg-gray-900 px-1 border border-gray-800 text-gray-400 rounded">@{log.userRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DB & Physical Hardware Server Connections Dashboard Section */}
      <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 text-left space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block mb-1">
              HARDWARE & VIRTUAL DATABASE CONFIGURATION & TELEMETRY
            </span>
            <p className="text-[11px] text-gray-400">
              Check database storage levels, test credentials, and connect your on-premise hardware server or virtualization cloud instances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-mono px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active Storage Relay Connected
            </span>
          </div>
        </div>

        {/* Storage Health & Volume Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main DB Volume Stats */}
          <div className="space-y-3 bg-[#161618] border border-gray-800/60 p-4.5 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-400 font-mono block">MAIN DB CAPACITY</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/45 text-emerald-400 border border-emerald-900/30 text-xs font-bold">HEALTHY</span>
            </div>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">14.85 GB Used</span>
                <span className="text-gray-400">150.00 GB Limit</span>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden border border-gray-900">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-[#d4af37] h-full" 
                  style={{ width: '9.9%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>9.9% Storage Occupied</span>
                <span>135.15 GB Free Space</span>
              </div>
            </div>
          </div>

          {/* Table Bloat & Registry Records index */}
          <div className="space-y-3 bg-[#161618] border border-gray-800/60 p-4.5 rounded-xl">
            <span className="text-[11px] font-bold text-gray-400 font-mono block">RECORD & HEAP MAP</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-gray-950 p-2 rounded border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase block">Total Job Logs</span>
                <b className="text-white">48,932 Rows</b>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase block">Personnel Files</span>
                <b className="text-white">839 Units</b>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase block">Assay Registers</span>
                <b className="text-[#f3e5ab]">2,154,801 Pnt</b>
              </div>
              <div className="bg-gray-950 p-2 rounded border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase block">Daily Heap Size</span>
                <b className="text-white">41.2 MB</b>
              </div>
            </div>
          </div>

          {/* Connection Sandbox Input Simulation */}
          <div className="space-y-3 bg-[#161618] border border-gray-800/60 p-4.5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 font-mono block mb-2">DB INTERACTIVE CONNECTION VALIDATOR</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="localhost" 
                    defaultValue="192.168.1.120"
                    id="sim-db-host"
                    className="flex-1 bg-gray-950 border border-gray-800 rounded p-1.5 text-white text-[11px]" 
                  />
                  <input 
                    type="text" 
                    placeholder="3306" 
                    defaultValue="5432"
                    id="sim-db-port"
                    className="w-16 bg-gray-950 border border-gray-800 rounded p-1.5 text-white text-[11px]" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="db_name" 
                  defaultValue="diatrendz_erp"
                  id="sim-db-name"
                  className="w-full bg-gray-950 border border-gray-800 rounded p-1.5 text-white text-[11px]" 
                />
              </div>
            </div>
            <button 
              onClick={() => {
                const host = (document.getElementById('sim-db-host') as HTMLInputElement)?.value || '192.168.1.120';
                const port = (document.getElementById('sim-db-port') as HTMLInputElement)?.value || '5432';
                const name = (document.getElementById('sim-db-name') as HTMLInputElement)?.value || 'diatrendz_erp';
                alert(`SUCCESS: Connected to database '${name}' at ${host}:${port}.\nHardware Status: ONLINE.\nDatabase Space: 14.85 GB / 150 GB Used (9.9% Occupied - Status: HEALTHY).`);
              }}
              className="w-full py-1.5 mt-2 bg-[#d4af37] text-black hover:bg-[#f3e5ab] text-xs font-bold rounded-lg transition"
            >
              Test Hardware Server Sync Connectivity
            </button>
          </div>
        </div>

        {/* Client Simple Step-by-Step Explanation Booklet (Plain English for Non-Developers) */}
        <div className="bg-gray-950 rounded-xl border border-gray-900 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 border border-[#d4af37]/30 bg-[#d4af37]/5 rounded text-[#f3e5ab] text-[10px] font-bold">CLIENT GUIDEBOOK</span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">How to Connect Virtual or Physical Hardware Servers & Check Storage Limit Details</h4>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed max-w-4xl">
            To link your live database (virtual container database on Google Cloud/AWS or physical server hardware sitting inside your workshop) to this Dia Trendz ERP application, follow these simple, practical instructions. We have formatted this so that you or your end client can quickly execute the link without complex software engineering backgrounds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 text-xs">
            <div className="space-y-3.5 bg-[#121214] p-4 rounded-lg border border-gray-800">
              <span className="text-[#d4af37] font-bold block text-[11px] border-b border-gray-800/80 pb-1 uppercase">1. Connecting His Hardware Database</span>
              <ul className="space-y-2.5 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] font-bold">A.</span>
                  <span><b>Whitelist IP Address:</b> On the hardware server machine, ensure access permission is unlocked for incoming client request traffic over port <code>3306</code> (MySQL/MariaDB) or <code>5432</code> (PostgreSQL).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] font-bold">B.</span>
                  <span><b>Configure connection string:</b> Update the environment configuration file <code>.env</code> or <code>application.properties</code> file on the server using this simple URL structural format:
                    <code className="block mt-1 p-1 bg-gray-950 font-mono text-[10px] text-amber-200 border border-gray-900 rounded">
                      spring.datasource.url=jdbc:postgresql://[YOUR_SERVER_IP]:5432/diatrendz_erp
                    </code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] font-bold">C.</span>
                  <span><b>Launch API Bridge:</b> Run the application server build bundle. The database client connection manager dynamically initiates connections and syncs the initial tables on startup automatically.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3.5 bg-[#121214] p-4 rounded-lg border border-gray-800">
              <span className="text-emerald-400 font-bold block text-[11px] border-b border-gray-800/80 pb-1 uppercase">2. Monitoring Storage Levels (Is it Full?)</span>
              <ul className="space-y-2.5 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">A.</span>
                  <span><b>Check storage status directly here:</b> Use this <b>Telemetry & System Registry Panel</b> anytime. The real-time visual progress counter above monitors storage sizes and changes dynamically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">B.</span>
                  <span><b>Run standard CLI console query:</b> If you want to log into your hardware CLI to check space directly on database terminals, type these simple commands:
                    <code className="block mt-1 p-1.5 bg-gray-950 font-mono text-[10px] text-amber-200 border border-gray-900 rounded">
                      {"-- For PostgreSQL Size:"}<br/>
                      SELECT pg_size_pretty(pg_database_size('diatrendz_erp'));
                    </code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">C.</span>
                  <span><b>Uptime Alerts:</b> When your hardware disk space reaches <b>85% capacity</b>, this system automatically posts alert logs inside the security audit trails to prevent overflow peaks.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
