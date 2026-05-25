/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserPlus, UserX, UserCheck, ShieldAlert, Award, Star, Mail, Phone, Calendar as DateIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface EmployeeFormProps {
  currentUser: any;
  onRefreshMetrics?: () => void;
  onSelectEmployee?: (emp: UserType) => void;
}

const safeResponseParse = async (res: Response) => {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      return { message: text || `HTTP Error ${res.status}: ${res.statusText}` };
    }
  } catch (err) {
    return { message: `HTTP Parsing Error ${res.status}: ${res.statusText}` };
  }
};

export function EmployeeForm({ currentUser, onRefreshMetrics, onSelectEmployee }: EmployeeFormProps) {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for creating employees
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'QC'>('EMPLOYEE');
  const [department, setDepartment] = useState('Polishing');
  const [specialization, setSpecialization] = useState('Solitaire Rings');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Expert' | 'Master'>('Expert');
  const [leaveBalance, setLeaveBalance] = useState(15);
  const [password, setPassword] = useState('Admin@123');
  const [profileImage, setProfileImage] = useState('');

  // Selected employee for editing properties
  const [editingEmp, setEditingEmp] = useState<UserType | null>(null);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [togglingId, setTogglingId] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
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

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!fullName || !email) {
      setFormError('Name and official email are required.');
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          role,
          department,
          specialization,
          skillLevel,
          leaveBalance,
          password,
          profileImage,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      const data = await safeResponseParse(res);
      if (!res.ok) {
        throw new Error(data.message || 'Action rejected by server.');
      }

      setFormSuccess(`Crew member registered successfully as ID: ${data.employee.id}`);
      setFullName('');
      setEmail('');
      setPhone('');
      setLeaveBalance(15);
      setPassword('Admin@123');
      setProfileImage('');
      fetchEmployees();
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err: any) {
      setFormError(err.message || 'Creation error.');
    }
  };

  const updateStatus = async (emp: UserType, statusVal: 'ACTIVE' | 'DISABLED') => {
    setTogglingId(emp.id);
    try {
      const res = await fetch('/api/employees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: emp.id,
          status: statusVal,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        fetchEmployees();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId('');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEmp) return;
    try {
      const res = await fetch('/api/employees/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEmp.id,
          fullName: editingEmp.fullName,
          email: editingEmp.email,
          phone: editingEmp.phone,
          profileImage: editingEmp.profileImage,
          department: editingEmp.department,
          specialization: editingEmp.specialization,
          skillLevel: editingEmp.skillLevel,
          leaveBalance: editingEmp.leaveBalance,
          productivityScore: editingEmp.productivityScore,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role
        })
      });

      if (res.ok) {
        setEditingEmp(null);
        fetchEmployees();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="crew-administration-module" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            CRAFT PERSONNEL & SYSTEM ROSTER
          </h2>
          <p className="text-xs text-gray-400">
            Provision roles, monitor productivity ratios, and handle workforce configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Panel */}
        <div className="bg-[#121214]/95 border border-gray-800 rounded-2xl p-6 self-start space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-2">
            Enroll Craft Specialist
          </span>

          <form onSubmit={handleCreateEmployee} className="space-y-4 text-left">
            {formSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl">
                ✓ {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs rounded-xl">
                ✕ {formError}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                placeholder="Ahmed Bin Al-Maktoum"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                placeholder="ahmed@diatrendz.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                  placeholder="+971 50..."
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Passcode</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-300"
                  placeholder="Admin@123"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#d4af37] mb-1">Staff Role</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200 font-bold"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="QC">QC TEAM</option>
                  {currentUser.role === 'SUPER_ADMIN' && <option value="ADMIN">TL (ADMIN)</option>}
                  {currentUser.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Vacation Balance</label>
                <input
                  type="number"
                  value={leaveBalance}
                  onChange={(e) => setLeaveBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                >
                  <option value="Casting">Casting Dept</option>
                  <option value="Polishing">Polishing Dept</option>
                  <option value="Setting">Diamond Setting</option>
                  <option value="Engraving">Hand Engraving</option>
                  <option value="QC">Quality Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Skill Tier</label>
                <select
                  value={skillLevel}
                  onChange={(e: any) => setSkillLevel(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  <option value="Master">Master</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Specialization Focus</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2.5 text-gray-200"
                placeholder="e.g. Solitaire Prong Grinding"
              />
            </div>

            <div className="space-y-2 p-3.5 bg-[#18181b]/55 border border-gray-800/80 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">Artisan Profile Photo</span>
              <div className="flex items-center gap-3">
                {profileImage ? (
                  <div className="relative p-0.5 border border-[#d4af37]/40 rounded-full bg-black shrink-0">
                    <img
                      src={profileImage}
                      alt="Artisan Portrait Preview"
                      className="w-11 h-11 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setProfileImage('')}
                      className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 rounded-full text-white text-[8px] w-4 h-4 flex items-center justify-center font-bold border border-black"
                      title="Clear Photo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full border border-dashed border-gray-700 flex items-center justify-center text-gray-600 font-bold text-[9px] bg-black uppercase select-none shrink-0">
                    No Pic
                  </div>
                )}
                <div className="flex-1 space-y-1.5 text-left">
                  <input
                    type="text"
                    placeholder="Paste Web Portrait URL"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-gray-850 rounded-lg text-[10px] p-2 text-gray-300 focus:outline-none focus:border-[#d4af37]"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="artisan-portrait-uploader"
                    />
                    <label
                      htmlFor="artisan-portrait-uploader"
                      className="inline-block px-3 py-1 bg-gray-850 hover:bg-gray-800 text-gray-300 text-[9px] font-extrabold uppercase rounded border border-gray-700 cursor-pointer select-none transition"
                    >
                      Choose Local Image File
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Enroll Specialist
            </button>
          </form>
        </div>

        {/* Directory Listing Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-[#121214]/95 border border-gray-800 rounded-2xl">
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab] font-bold block pb-3 border-b border-gray-800 mb-4">
              Registered Crew members directory ({employees.length})
            </span>

            {loading ? (
              <div className="text-center py-8 text-xs text-gray-500">Retrieving system ledger files...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500">No personnel registered yet.</div>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee?.(emp)}
                    data-hover-employee-id={emp.id}
                    className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#d4af37]/40 hover:bg-gray-800/10 transition cursor-pointer"
                  >
                    <div className="flex gap-3 text-left items-center">
                      {emp.profileImage ? (
                        <img
                          src={emp.profileImage}
                          alt={emp.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37]/25 to-transparent border border-[#d4af37]/40 flex items-center justify-center text-white font-bold text-xs font-mono shrink-0">
                          {emp.fullName.split(' ').map(n=>n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-white">{emp.fullName}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#18181a] text-gray-400 border border-gray-800">{emp.id}</span>
                          
                          {/* Live availability flag badge */}
                          {(() => {
                            if (emp.role !== 'EMPLOYEE') return null;
                            const unfinished = tasks.filter(t => t.assignedEmployeeId === emp.id && t.status !== 'Completed' && t.status !== 'Cancelled');
                            const active = unfinished.filter(t => t.status === 'In Progress' || t.status === 'Rework');
                            
                            if (emp.status === 'DISABLED') {
                              return <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-zinc-950/20 bg-zinc-805 text-zinc-500">Deactivated</span>;
                            }
                            if (emp.leaveStatus === 'ON_LEAVE') {
                              return <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-blue-900/45 bg-blue-950/50 text-blue-400">On Leave 🌴</span>;
                            }
                            if (active.length > 0) {
                              return <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-red-900/45 bg-red-950/40 text-red-400">Working 🔴</span>;
                            }
                            if (unfinished.length > 0) {
                              return <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-amber-900/50 bg-amber-950/40 text-amber-400">Idle (Paused) 🟡</span>;
                            }
                            return <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-green-950 bg-[#0f241a] text-green-400">Free ✨</span>;
                          })()}
                        </div>
                        <p className="text-xs text-gray-400">Department: <b className="text-gray-200">{emp.department || 'All'}</b> • Skill: <b className="text-[#f3e5ab]">{emp.skillLevel || 'Expert'}</b></p>
                        <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-600" /> {emp.email}</span>
                          {emp.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3 text-gray-600" /> {emp.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-gray-800/50">
                      {/* Productivity indicator */}
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase">Productivity</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-[#d4af37] fill-[#d4af37]" />
                          <span className="font-mono text-xs font-bold text-white">{emp.productivityScore || 85}%</span>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEmp(emp);
                          }}
                          className="p-1 px-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] font-semibold"
                        >
                          Modify
                        </button>

                        {emp.id !== currentUser.id && (
                          emp.status === 'ACTIVE' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(emp, 'DISABLED');
                              }}
                              disabled={togglingId === emp.id}
                              className="p-1 px-2 bg-rose-950/40 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-900/50 hover:border-transparent rounded text-[10px]"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(emp, 'ACTIVE');
                              }}
                              disabled={togglingId === emp.id}
                              className="p-1 px-2 bg-emerald-950/40 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-900/50 hover:border-transparent rounded text-[10px]"
                            >
                              Enable
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editing Modal Popup */}
      {editingEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#121214] border border-[#d4af37]/35 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white uppercase">Modify Profile Details</h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingEmp.fullName}
                  onChange={(e) => setEditingEmp({ ...editingEmp, fullName: e.target.value })}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  value={editingEmp.email}
                  onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={editingEmp.phone || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                  className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Teammate Profile Photo</label>
                <div className="flex items-center gap-3 p-2 bg-[#18181b]/55 border border-gray-800 rounded-lg">
                  {editingEmp.profileImage ? (
                    <img 
                      src={editingEmp.profileImage} 
                      alt="Artisan Portrait Preview" 
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-dashed border-gray-750 flex items-center justify-center text-gray-650 font-bold text-[8px] uppercase select-none shrink-0 bg-black">
                      No Pic
                    </div>
                  )}
                  <div className="flex-1 space-y-1 text-left">
                    <input
                      type="text"
                      placeholder="Paste portrait URL"
                      value={editingEmp.profileImage || ''}
                      onChange={(e) => setEditingEmp({ ...editingEmp, profileImage: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-gray-850 rounded text-[10px] p-1.5 text-gray-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingEmp({ ...editingEmp, profileImage: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="artisan-edit-portrait"
                      />
                      <label 
                        htmlFor="artisan-edit-portrait"
                        className="inline-block px-2.5 py-0.5 bg-gray-850 hover:bg-gray-800 text-gray-300 text-[8px] font-bold uppercase rounded border border-gray-750 cursor-pointer select-none transition"
                      >
                        Upload Photo File
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={editingEmp.department || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                    className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Specialization Focus</label>
                  <input
                    type="text"
                    value={editingEmp.specialization || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, specialization: e.target.value })}
                    className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Productivity Score %</label>
                  <input
                    type="number"
                    value={editingEmp.productivityScore || 85}
                    onChange={(e) => setEditingEmp({ ...editingEmp, productivityScore: Number(e.target.value) })}
                    className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                    max={100}
                    min={40}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Vacation Balance</label>
                  <input
                    type="number"
                    value={editingEmp.leaveBalance || 15}
                    onChange={(e) => setEditingEmp({ ...editingEmp, leaveBalance: Number(e.target.value) })}
                    className="w-full bg-[#1c1c1e] border border-gray-800 rounded-lg text-xs p-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setEditingEmp(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-xs font-semibold"
              >
                Discard Change
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-semibold text-xs rounded-xl hover:brightness-110"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
