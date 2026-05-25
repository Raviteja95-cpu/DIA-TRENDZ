/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Gem, LogIn, Lock, Mail, Server, Info } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Built-in credential helper lists for easy assessment/testing
  const quickLogins = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@gmail.com', pass: 'Admin@123' },
    { role: 'ADMIN', label: 'Team Lead', email: 'lead@diatrendz.com', pass: 'Admin@123' },
    { role: 'EMPLOYEE 1', label: 'Gold Polisher (Rajesh)', email: 'rajesh@diatrendz.com', pass: 'Admin@123' },
    { role: 'EMPLOYEE 2', label: 'Necklace Master (Deepa)', email: 'deepa@diatrendz.com', pass: 'Admin@123' },
    { role: 'QC', label: 'QC Team', email: 'qc@diatrendz.com', pass: 'Admin@123' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both administrative inputs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Validation failed. Check credentials.');
      }

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#04091a] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Absolute Radial Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,rgba(31,58,138,0.18)_40%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[radial-gradient(circle,rgba(212,175,55,0.03)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

      {/* Corporate Branding Headers */}
      <div className="text-center z-10 max-w-md w-full mb-8">
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-[#0b152d] to-[#04091a] border border-[#d4af37]/45 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.15)] mb-4 animate-pulse">
          <Gem className="h-9 w-9 text-[#d4af37]" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-widest text-white uppercase font-serif">
          DIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3e5ab] via-[#d4af37] to-[#aa7c11]">TRENDZ</span>
        </h1>
        <p className="mt-2 text-[10px] text-[#f3e5ab]/80 tracking-widest uppercase">
          ✦ Enterprise Jewelry Production Suite ✦
        </p>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Main Glassmorphic Form Container */}
        <div className="bg-[#0b152d]/95 backdrop-blur-2xl border border-[#1f3460] rounded-3xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
          <h2 className="text-base font-semibold text-[#f3e5ab] mb-6 flex items-center gap-2 tracking-wide">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" /> Terminal Gateway Sign-In
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#f3e5ab]/70 uppercase tracking-widest mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#d4af37]/60" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 bg-[#060c1c] border border-[#1f3460] rounded-xl text-sm text-[#cbd5e1] placeholder-slate-600 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition duration-200"
                  placeholder="name@diatrendz.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3e5ab]/70 uppercase tracking-widest mb-1.5">
                Gate Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#d4af37]/60" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 bg-[#060c1c] border border-[#1f3460] rounded-xl text-sm text-[#cbd5e1] placeholder-slate-600 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition duration-200"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-sm rounded-xl hover:from-[#f3e5ab] hover:to-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition duration-200 shadow-[0_4px_25px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Grant Access Permission
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Login Section */}
          <div className="mt-8 border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-[#d4af37] animate-pulse" />
              <p className="text-xs font-semibold text-[#f3e5ab] uppercase tracking-wider">
                Enterprise Quick-Role Switcher
              </p>
            </div>
            <p className="text-[11px] text-gray-400 mb-3.5">
              Select an authorized employee file below to prefill standard secure credentials.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleQuickLogin(item.email, item.pass)}
                  className={`p-2.5 text-[11px] rounded-lg border text-left transition select-none ${
                    email.toLowerCase() === item.email.toLowerCase()
                      ? 'bg-gradient-to-br from-[#d4af37]/15 to-transparent border-[#d4af37]/50 text-white'
                      : 'bg-[#161618] border-gray-800 hover:border-gray-700 text-gray-400'
                  }`}
                >
                  <div className="font-bold text-[#f3e5ab]">{item.label}</div>
                  <div className="opacity-60 truncate">{item.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security / System Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-500 tracking-wider">
            SECURE SHA-256 ENCRYPTION PORTAL • AUTOMATED AUDIT RECORDING ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
