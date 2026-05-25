/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  Clock, 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Grid, 
  Sparkles,
  Layers,
  Container,
  Cpu,
  Bookmark,
  Activity,
  CheckCircle,
  HelpCircle,
  Clock3,
  Flame,
  Binary,
  Hammer
} from 'lucide-react';
import { JobCard } from '../types';

interface JobBagTrackerProps {
  tasks: JobCard[];
  currentUser?: any;
  onSelectEmployee?: (empId: string) => void;
  selectedTrackerJobId?: string | null;
  onSelectTrackerJobId?: (id: string | null) => void;
}

// Fixed list of precision production departments in the Dia Trendz facility
interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  leadPerson: string;
  floorZone: string;
  icon: React.ReactNode;
}

// Interactive illustration envelopes representing different items at various departments
interface IllustrativeBag {
  id: string;
  customerName: string;
  jewelryType: string;
  materialType: string;
  goldWeight: number;
  dueDate: string;
  assignedEmployeeName: string;
  assignedEmployeeId: string;
  status: string; // Maps to department state
  notes: string;
  costEstimate: number;
  timeline: Array<{
    status: string;
    payload: string;
    user: string;
    timestamp: string;
  }>;
}

const ILLUSTRATIVE_BAG_EXAMPLES: IllustrativeBag[] = [
  {
    id: 'JOB-DSN-101',
    customerName: 'Marcus Aurelius Sterling',
    jewelryType: 'Royal Signet Ring',
    materialType: '24K Fine Yellow Gold',
    goldWeight: 18.5,
    dueDate: '2026-06-01',
    assignedEmployeeName: 'Elena Rostova',
    assignedEmployeeId: 'EMP001',
    status: 'Assigned', // Leads to 'design'
    notes: 'Awaiting signature verification for engraving seal.',
    costEstimate: 2450,
    timeline: [
      { status: 'Pouch Issued', payload: 'Signet blank initialized', user: 'Admin Desk', timestamp: '2026-05-23T08:00:00Z' }
    ]
  },
  {
    id: 'JOB-CAD-202',
    customerName: 'Livia Drusilla',
    jewelryType: 'Emerald Halo Pendant',
    materialType: '18K White Gold Alloy',
    goldWeight: 12.0,
    dueDate: '2026-06-03',
    assignedEmployeeName: 'Dominic Thiem',
    assignedEmployeeId: 'EMP002',
    status: 'Waiting Approval', // Leads to 'cad'
    notes: 'Digital mesh model is rendered. CAD files sent for review.',
    costEstimate: 4100,
    timeline: [
      { status: 'Pouch Issued', payload: 'Pendant CAD initialized', user: 'Admin Desk', timestamp: '2026-05-22T09:00:00Z' },
      { status: 'Assigned', payload: '3D wax render complete', user: 'Elena Rostova', timestamp: '2026-05-22T14:30:00Z' }
    ]
  },
  {
    id: 'JOB-CST-303',
    customerName: 'Flavia Domitilla',
    jewelryType: 'Roman Twist Cufflinks',
    materialType: '22K Dark Amber Alloy',
    goldWeight: 22.4,
    dueDate: '2026-05-30',
    assignedEmployeeName: 'Marcus Vance',
    assignedEmployeeId: 'EMP003',
    status: 'Approved', // Leads to 'alloy'
    notes: 'Casting tree plaster mold curing under vacuum.',
    costEstimate: 3150,
    timeline: [
      { status: 'Pouch Issued', payload: 'Blank cufflinks setup', user: 'Admin Desk', timestamp: '2026-05-21T10:00:00Z' },
      { status: 'Assigned', payload: 'Casting blueprint approved', user: 'Elena Rostova', timestamp: '2026-05-21T11:30:00Z' },
      { status: 'Waiting Approval', payload: 'Wax print verify check', user: 'Dominic Thiem', timestamp: '2026-05-21T16:00:00Z' }
    ]
  },
  {
    id: 'JOB-SRT-404',
    customerName: 'Hadrian Caesar Augustus',
    jewelryType: 'Prong Solitaire Tennis Bracelet',
    materialType: '18K Platinum Blend',
    goldWeight: 32.0,
    dueDate: '2026-06-10',
    assignedEmployeeName: 'Sophia Chen',
    assignedEmployeeId: 'EMP004',
    status: 'Accepted', // Leads to 'sorting'
    notes: 'Allocating forty-two matching VVS1 diamonds.',
    costEstimate: 12400,
    timeline: [
      { status: 'Pouch Issued', payload: 'Tennis strand setup', user: 'Admin Desk', timestamp: '2026-05-20T11:00:00Z' },
      { status: 'Assigned', payload: 'Link model validation', user: 'Elena Rostova', timestamp: '2026-05-20T15:00:00Z' },
      { status: 'Approved', payload: 'Platinum casting complete', user: 'Marcus Vance', timestamp: '2026-05-21T10:00:00Z' }
    ]
  },
  {
    id: 'JOB-SET-505',
    customerName: 'Zenobia Palmyra',
    jewelryType: 'Bespoke Vintage Studs',
    materialType: '22K Soft Rose Gold',
    goldWeight: 9.8,
    dueDate: '2026-05-28',
    assignedEmployeeName: 'Arthur Pendelton',
    assignedEmployeeId: 'EMP005',
    status: 'In Progress', // Leads to 'setting'
    notes: 'Micro-prong setting the ruby centerpieces.',
    costEstimate: 5600,
    timeline: [
      { status: 'Pouch Issued', payload: 'Stud mounts allocated', user: 'Admin Desk', timestamp: '2026-05-19T09:00:00Z' },
      { status: 'Approved', payload: 'Plaster sprue cured', user: 'Marcus Vance', timestamp: '2026-05-20T12:00:00Z' },
      { status: 'Accepted', payload: 'Rubies clarity matched', user: 'Sophia Chen', timestamp: '2026-05-21T09:30:00Z' }
    ]
  },
  {
    id: 'JOB-POL-606',
    customerName: 'Constantine the Great',
    jewelryType: 'Laurel Crown Ring',
    materialType: '24K Gold Leaf Overlay',
    goldWeight: 14.5,
    dueDate: '2026-05-27',
    assignedEmployeeName: 'Renato Rossi',
    assignedEmployeeId: 'EMP006',
    status: 'Switched', // Leads to polish/setting standby
    notes: 'Awaiting first rotary polish and ultrasonic clean cycle.',
    costEstimate: 1980,
    timeline: [
      { status: 'Pouch Issued', payload: 'Pouch generated', user: 'Admin Desk', timestamp: '2026-05-18T10:00:00Z' },
      { status: 'Approved', payload: 'Gold leaves caste', user: 'Marcus Vance', timestamp: '2026-05-19T14:40:00Z' },
      { status: 'In Progress', payload: 'Micro hand engraving', user: 'Arthur Pendelton', timestamp: '2026-05-20T17:00:00Z' }
    ]
  },
  {
    id: 'JOB-QCA-707',
    customerName: 'Theodora Byzantine Empress',
    jewelryType: 'Sovereign Choker Necklace',
    materialType: '18K Premium Gold Alloy',
    goldWeight: 45.0,
    dueDate: '2026-05-25',
    assignedEmployeeName: 'Clara Oswald',
    assignedEmployeeId: 'EMP007',
    status: 'QC Pending', // Leads to 'qc'
    notes: 'Spectroscopy scanning for carat concentration validation.',
    costEstimate: 14500,
    timeline: [
      { status: 'Pouch Issued', payload: 'Heavy frame issued', user: 'Admin Desk', timestamp: '2026-05-15T09:00:00Z' },
      { status: 'Approved', payload: 'Casting tree cleared', user: 'Marcus Vance', timestamp: '2026-05-17T11:00:00Z' },
      { status: 'Accepted', payload: 'Emerald sorting clear', user: 'Sophia Chen', timestamp: '2026-05-18T15:10:00Z' },
      { status: 'In Progress', payload: 'Main frame stone setting', user: 'Arthur Pendelton', timestamp: '2026-05-20T18:00:00Z' }
    ]
  },
  {
    id: 'JOB-VLT-808',
    customerName: 'Aurelian Sol Invictus',
    jewelryType: 'Palace Drop Earrings',
    materialType: '22K Fine Yellow Gold',
    goldWeight: 26.1,
    dueDate: '2026-05-24',
    assignedEmployeeName: 'Hassan Al-Sabbah',
    assignedEmployeeId: 'EMP008',
    status: 'Completed', // Leads to 'vault'
    notes: 'Velvet wrapped. Passed X-Ray Hallmark inspection.',
    costEstimate: 8500,
    timeline: [
      { status: 'Pouch Issued', payload: 'Lobe wire hoops blank', user: 'Admin Desk', timestamp: '2026-05-12T08:00:00Z' },
      { status: 'Approved', payload: 'Gold hoops casting done', user: 'Marcus Vance', timestamp: '2026-05-14T11:00:00Z' },
      { status: 'Accepted', payload: 'Stones verified', user: 'Sophia Chen', timestamp: '2026-05-15T15:00:00Z' },
      { status: 'In Progress', payload: 'Baguette channel locking', user: 'Arthur Pendelton', timestamp: '2026-05-17T17:00:00Z' },
      { status: 'QC Pending', payload: 'Passed visual clean scan', user: 'Clara Oswald', timestamp: '2026-05-20T13:30:00Z' },
      { status: 'Completed', payload: 'Rhodium plate and clean clear', user: 'Renato Rossi', timestamp: '2026-05-21T18:00:00Z' }
    ]
  }
];

export function JobBagTracker({ 
  tasks, 
  currentUser,
  onSelectEmployee, 
  selectedTrackerJobId, 
  onSelectTrackerJobId 
}: JobBagTrackerProps) {
  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const [showOthers, setShowOthers] = useState(!isEmployee);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedJob, setLocalSelectedJob] = useState<any | null>(null);
  const [searchSuccessPopup, setSearchSuccessPopup] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Combined master source of jobs = genuine active tasks + our 8 highly detailed illustrative reference cases
  const allAvailableBags = useMemo(() => {
    // Standardize genuine tasks into tracker-compatible schema
    let filteredTasks = tasks;
    if (isEmployee && !showOthers) {
      filteredTasks = tasks.filter(t => t.assignedEmployeeId === currentUser?.id);
    }

    const genuineMapped = filteredTasks.map(t => ({
      id: t.id,
      customerName: t.customerName,
      jewelryType: t.jewelryType,
      materialType: t.materialType || 'Gold / Diamond Base',
      goldWeight: t.goldWeight || 12.5,
      dueDate: t.dueDate,
      assignedEmployeeName: t.assignedEmployeeName || 'Awaiting Specialist',
      assignedEmployeeId: t.assignedEmployeeId || '',
      status: t.status,
      notes: t.remarks || 'Routine production dispatch workflow.',
      costEstimate: Math.round((t.goldWeight || 10) * 80 * 1.45 + (t.approvedTime || 5) * 55 + 450),
      timeline: t.timeline || [
        { status: 'Pouch Issued', payload: 'Production card released to floor', user: 'Admin Control', timestamp: new Date(Date.now() - 36000000).toISOString() }
      ],
      isExample: false
    }));

    let illustrativeMapped = ILLUSTRATIVE_BAG_EXAMPLES;
    if (isEmployee && !showOthers) {
      illustrativeMapped = ILLUSTRATIVE_BAG_EXAMPLES.filter(ex => ex.assignedEmployeeId === currentUser?.id);
    }

    const illustrativeMappedRes = illustrativeMapped.map(ex => ({
      ...ex,
      isExample: true
    }));

    return [...genuineMapped, ...illustrativeMappedRes];
  }, [tasks, isEmployee, showOthers, currentUser]);

  // Synchronize with external selection states (like searches made in the main header topbar)
  useEffect(() => {
    if (selectedTrackerJobId) {
      const match = allAvailableBags.find(
        b => b.id.toUpperCase() === selectedTrackerJobId.toUpperCase()
      );
      if (match) {
        setLocalSelectedJob(match);
        setSearchTerm(match.id);
        
        // Trigger a beautiful visual popup notification confirmation of locate
        setSearchSuccessPopup(`Successfully located Bag ${match.id} tracking signature!`);
        const timer = setTimeout(() => setSearchSuccessPopup(null), 4000);
        return () => clearTimeout(timer);
      }
    } else if (!localSelectedJob && allAvailableBags.length > 0) {
      // default selection
      setLocalSelectedJob(allAvailableBags[allAvailableBags.length - 1]);
    }
  }, [selectedTrackerJobId, allAvailableBags]);

  // Determine active department ID based on system status string
  const getJobDepartmentInfo = (status: string): { activeDeptId: string; subStatus: string; binLocation: string } => {
    switch (status) {
      case 'Assigned':
        return { activeDeptId: 'design', subStatus: 'Blueprint CAD specifications setup', binLocation: 'Blueprint Shelf Alpha-1' };
      case 'Waiting Approval':
        return { activeDeptId: 'cad', subStatus: 'Digital render & mold layout approval', binLocation: 'Queue Box CAD-3' };
      case 'Approved':
        return { activeDeptId: 'alloy', subStatus: 'Gold alloy induction tree curing', binLocation: 'Alloy Drawer #12' };
      case 'Accepted':
        return { activeDeptId: 'sorting', subStatus: 'Sorting center diamond and gemstone match', binLocation: 'Sorting Bag S-4' };
      case 'In Progress':
        return { activeDeptId: 'setting', subStatus: 'Bench jewel mount and lock-up', binLocation: 'Workbench Setting Tray 7' };
      case 'Paused':
      case 'Switched':
        return { activeDeptId: 'polishing', subStatus: 'Mirror-finish polishing and liquid cleaning bath', binLocation: 'Artisan Safe Vault Box 4' };
      case 'QC Pending':
        return { activeDeptId: 'qc', subStatus: 'Purity check and Hallmark laser stamping', binLocation: 'QC Inspection Rack B' };
      case 'Completed':
        return { activeDeptId: 'vault', subStatus: 'Shipping package locked in safe', binLocation: 'Main Vault Safe Zone 6' };
      case 'Rework':
        return { activeDeptId: 'sorting', subStatus: 'Precious gem prong alignment rework setup', binLocation: 'Sorting Safe Rack 3' };
      case 'Cancelled':
        return { activeDeptId: 'alloy', subStatus: 'Meltdown & gold reclaim scheduling', binLocation: 'Scrap Locker C' };
      default:
        return { activeDeptId: 'setting', subStatus: 'Bench work handoff queue buffer', binLocation: 'General Bench B5' };
    }
  };

  const handleSearchLocate = (jobId: string) => {
    if (!jobId.trim()) return;
    const cleanId = jobId.trim().toUpperCase();
    const found = allAvailableBags.find(b => b.id.toUpperCase() === cleanId);
    
    if (found) {
      setLocalSelectedJob(found);
      setErrorMessage('');
      if (onSelectTrackerJobId) {
        onSelectTrackerJobId(found.id);
      }
      setSearchSuccessPopup(`Spot Lock identified Bag: ${found.id}`);
      setTimeout(() => setSearchSuccessPopup(null), 3000);
    } else {
      setErrorMessage(`Job Bag "${cleanId}" could not be locked under currently active floor networks.`);
    }
  };

  // 8 key factory departments with layout & detail data
  const DEPARTMENTS: Department[] = [
    { 
      id: 'design', 
      name: 'Designing Desk & Blueprint', 
      code: 'DSN-01', 
      description: 'Hand sketches, metal weight projections, and digital scaling layout curves.', 
      leadPerson: 'Elena Rostova', 
      floorZone: 'Zone A - Studio Loft',
      icon: <Layers className="w-4 h-4 text-sky-400" />
    },
    { 
      id: 'cad', 
      name: 'High-Precision CAD Lab & 3D Wax', 
      code: 'CAD-02', 
      description: 'Rhinoceros CAD mesh rendering, resin printing, and wax support modeling.', 
      leadPerson: 'Dominic Thiem', 
      floorZone: 'Zone A - Digital Suite',
      icon: <Binary className="w-4 h-4 text-teal-400" />
    },
    { 
      id: 'alloy', 
      name: 'Induction Crucible & Alloy Refining', 
      code: 'CST-03', 
      description: 'Solid gold bar induction melting, casting plaster vacuums, and cooling sprues.', 
      leadPerson: 'Marcus Vance', 
      floorZone: 'Zone B - Hot Shop',
      icon: <Flame className="w-4 h-4 text-orange-400" />
    },
    { 
      id: 'sorting', 
      name: 'Gem Sorting & Diamond Allocation', 
      code: 'SRT-04', 
      description: 'Diamond scale sizing, clarity checks under magnifier loupe, and color matching.', 
      leadPerson: 'Sophia Chen', 
      floorZone: 'Zone B - Sorting Lab',
      icon: <Grid className="w-4 h-4 text-purple-400" />
    },
    { 
      id: 'setting', 
      name: 'Master Bench & Stone Setting', 
      code: 'SET-05', 
      description: 'Pave bead lock up, tension channel placement, hand prong tightening, and bevel punch.', 
      leadPerson: 'Arthur Pendelton', 
      floorZone: 'Zone C - General Bench',
      icon: <Hammer className="w-4 h-4 text-amber-400" />
    },
    { 
      id: 'polishing', 
      name: 'High-Luster Mirror Polishing', 
      code: 'POL-06', 
      description: 'Rotary rough polish, ultrasonic cleansing tanks, and rhodium plating chemical dips.', 
      leadPerson: 'Renato Rossi', 
      floorZone: 'Zone C - Wet Lab',
      icon: <Activity className="w-4 h-4 text-pink-400" />
    },
    { 
      id: 'qc', 
      name: 'QC Spectroscopy Inspection', 
      code: 'QCA-07', 
      description: 'Gold purity spectroscopy verifying carat index, and laser hallmark laser etching.', 
      leadPerson: 'Clara Oswald', 
      floorZone: 'Zone D - Pure Room',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />
    },
    { 
      id: 'vault', 
      name: 'Handoff Vault & Logistics Safe', 
      code: 'VLT-08', 
      description: 'Velvet wrap, premium box pack, and dual-custodian barcode logging for outer shipping dispatch.', 
      leadPerson: 'Hassan Al-Sabbah', 
      floorZone: 'Zone D - High Security Vault',
      icon: <Container className="w-4 h-4 text-indigo-400" />
    }
  ];

  // Map the current job tracking department coordinates
  const activeDeptLayout = useMemo(() => {
    if (!localSelectedJob) return null;
    const info = getJobDepartmentInfo(localSelectedJob.status);
    const index = DEPARTMENTS.findIndex(d => d.id === info.activeDeptId);
    return {
      activeDeptId: info.activeDeptId,
      subStatus: info.subStatus,
      binLocation: info.binLocation,
      activeIndex: index !== -1 ? index : 4
    };
  }, [localSelectedJob]);

  return (
    <div id="dia-trendz-job-bag-locator" className="space-y-6">
      
      {/* Search match popup confirmation alert */}
      {searchSuccessPopup && (
        <div className="bg-[#1c1409] border-l-4 border-[#d4af37] text-white p-4.5 rounded-r-xl shadow-2xl flex items-center justify-between text-left animate-bounce z-50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
            <div>
              <strong className="text-xs font-bold block text-white uppercase tracking-wider">Spot Precise Scan Lock</strong>
              <span className="text-xs text-gray-400 font-medium">{searchSuccessPopup}</span>
            </div>
          </div>
          <button onClick={() => setSearchSuccessPopup(null)} className="text-gray-500 hover:text-white text-xs font-bold font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-gray-900">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-wide uppercase flex items-center gap-2.5">
            <Package className="w-5.5 h-5.5 text-[#d4af37]" /> Spot Precision Job Bag Locator
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Real-time physical chain-of-custody tracking. Trace custom storage bins, active bench stations and exact department zoning statuses.
          </p>
        </div>

        {/* Dynamic status overview header cards */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/20 border border-emerald-900/35 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Floor Queues: Balanced
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#1c1409] border border-[#d4af37]/35 text-[10px] font-bold text-[#d4af37] flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Total Monitored Bags: {allAvailableBags.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Search and Department Bag lists */}
        <div className="lg:col-span-4 space-y-5">

          {isEmployee && (
            <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl text-left space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-extrabold font-mono">Workspace Data Protection</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Other technicians' jobs are filtered out of your default dashboard to help you focus.
              </p>
              <button
                type="button"
                onClick={() => setShowOthers(prev => !prev)}
                className="w-full py-2 rounded-xl bg-[#d4af37]/10 hover:bg-[#d4af37]/25 text-[#d4af37] hover:text-white border border-[#d4af37]/20 text-[10px] font-bold uppercase tracking-wider transition transition-colors"
              >
                {showOthers ? 'Switch to Confidential Mode' : 'Show All Floor Queues'}
              </button>
            </div>
          )}
          
          {/* Diagnostic barcode search */}
          <div className="p-5 bg-[#121214]/95 border border-gray-900 rounded-2xl text-left space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2.5 border-b border-gray-800">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-extrabold text-[#f3e5ab] uppercase tracking-wider">Spot Bag Barcode Scan</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Scan or enter the physical ID attached to the gold pouch envelope. Our registry matches it with its active floor zone.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSearchLocate(searchTerm); }} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-widest text-gray-500 font-extrabold">Enter Bag Signature / Job ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. JOB-CAD-202"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-950 border border-gray-850 rounded-xl text-xs font-mono font-extrabold text-[#f3e5ab] placeholder-gray-600 uppercase focus:outline-none focus:border-[#d4af37] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/25 rounded-lg transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-[10px] font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>

          {/* Department Queue Showcase List */}
          <div className="p-5 bg-[#121214]/95 border border-gray-900 rounded-2xl text-left space-y-4 shadow-xl">
            <div className="pb-2 border-b border-gray-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-extrabold text-[#f3e5ab] uppercase tracking-wider">Location Queue Indexes</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 font-extrabold uppercase">Demo roster</span>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Interactive representative bags distributed along each floor cell. Tap any row to instantly observe the live tracking flow.
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
              {allAvailableBags.map(bag => {
                const isSelected = localSelectedJob?.id === bag.id;
                const info = getJobDepartmentInfo(bag.status);
                const assignedDept = DEPARTMENTS.find(d => d.id === info.activeDeptId);

                return (
                  <button
                    key={bag.id}
                    type="button"
                    onClick={() => {
                      setLocalSelectedJob(bag);
                      setSearchTerm(bag.id);
                      setErrorMessage('');
                      if (onSelectTrackerJobId) {
                        onSelectTrackerJobId(bag.id);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-[#1c1409] border-[#d4af37]/80 shadow-md shadow-[#d4af37]/10' 
                        : 'bg-gray-950/70 border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-extrabold text-white text-[11px] flex items-center gap-1.5">
                        <Package className={`w-3 h-3 ${isSelected ? 'text-[#d4af37]' : 'text-gray-500'}`} />
                        {bag.id}
                        {bag.isExample && (
                          <span className="bg-[#f3e5ab]/10 text-[#f3e5ab] text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                            Preset
                          </span>
                        )}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                        bag.status === 'Completed'
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40'
                          : bag.status === 'In Progress'
                            ? 'bg-amber-950/20 text-amber-400 border-amber-900/40'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {bag.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-white truncate">
                      {bag.jewelryType} &mdash; <span className="text-gray-400 font-normal">{bag.customerName}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1.5 border-t border-gray-900/60 font-mono">
                      <span>Dept: <strong className="text-gray-300 font-sans">{assignedDept?.id.toUpperCase()}</strong></span>
                      <span>By: <span className="text-[#f3e5ab] font-sans font-bold">{bag.assignedEmployeeName.split(' ')[0]}</span></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (8 cols): Interactive Dashboard Flow and Detailed Stage Matrix */}
        <div className="lg:col-span-8 space-y-6">
          
          {localSelectedJob ? (
            <div className="p-6 bg-[#121214]/95 border border-gray-900 rounded-3xl text-left space-y-6 shadow-xl animate-in fade-in duration-200">
              
              {/* Dynamic Header Badge detailing Selected Bag */}
              <div className="p-4 bg-gray-950 border border-gray-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#d4af37] font-mono font-bold tracking-widest bg-amber-950/50 px-2 py-0.5 rounded border border-[#d4af37]/20 uppercase">
                      Physical Pouch Node ID: {localSelectedJob.id}
                    </span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-[11px] text-gray-400">
                      Material Specification: <b>{localSelectedJob.materialType}</b> ({localSelectedJob.goldWeight}g dry metal)
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-white tracking-wide">
                    {localSelectedJob.jewelryType} for {localSelectedJob.customerName}
                  </h3>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[9px] text-gray-500 uppercase font-mono font-bold block">Fulfillment target limit</span>
                  <span className="text-xs text-amber-400 font-mono font-extrabold block">{localSelectedJob.dueDate}</span>
                </div>
              </div>

              {/* Physical Location alert */}
              {activeDeptLayout && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1c1409]/80 to-[#121214] border border-[#d4af37]/80 shadow-lg shadow-[#d4af37]/5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[#d4af37] text-black rounded-2xl shadow-lg shadow-[#d4af37]/20 shrink-0">
                      <MapPin className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#f3e5ab]">ACTIVE FLOOR CARRIAGE LOCATION</span>
                      <h4 className="text-sm font-extrabold text-white mt-0.5 leading-snug">
                        {DEPARTMENTS[activeDeptLayout.activeIndex]?.name || 'Precision Setting Bench'}
                      </h4>
                      <p className="text-[11px] text-gray-400 tracking-wide mt-1">
                        {DEPARTMENTS[activeDeptLayout.activeIndex]?.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 md:pt-0 pl-12 md:pl-0 text-left md:text-right border-t md:border-t-0 border-gray-900 w-full md:w-auto shrink-0 space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Storage coordinate</span>
                    <strong className="text-white text-xs font-mono font-semibold bg-gray-950 px-2.5 py-1 rounded border border-gray-850 block w-max ml-0 md:ml-auto">
                      {activeDeptLayout.binLocation}
                    </strong>
                  </div>
                </div>
              )}

              {/* Crucial Section: PROCESS STATUS MATRIX per department (Started, In Progress, Not Started Yet) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-850">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#f3e5ab] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#d4af37]" /> Operational Stage Status Matrix
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono font-bold">8 Master Checkpoints</span>
                </div>

                {/* Display elegant grid representing status of every single step/department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {DEPARTMENTS.map((dept, idx) => {
                    const activeIdx = activeDeptLayout ? activeDeptLayout.activeIndex : 4;
                    
                    // Determine state status: "Completed (Started and Finished)", "In Progress (Currently Active)", or "Not Started Yet"
                    let statusLabel = 'Not Started Yet';
                    let statusColor = 'text-gray-500 border-gray-900 bg-gray-950/20';
                    let statusLineColor = 'bg-gray-800';
                    let stepIndicatorNode = null;

                    if (idx < activeIdx) {
                      statusLabel = 'Completed';
                      statusColor = 'text-emerald-400 border-emerald-950/30 bg-emerald-950/10';
                      statusLineColor = 'bg-emerald-600';
                      stepIndicatorNode = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                    } else if (idx === activeIdx) {
                      statusLabel = 'In Progress';
                      statusColor = 'text-amber-400 border-amber-950/60 bg-[#1b120c]/90';
                      statusLineColor = 'bg-amber-500';
                      stepIndicatorNode = <Clock3 className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />;
                    } else {
                      statusLabel = 'Not Started Yet';
                      statusColor = 'text-zinc-600 border-zinc-900 bg-zinc-950/10';
                      statusLineColor = 'bg-zinc-900';
                      stepIndicatorNode = <HelpCircle className="w-4 h-4 text-zinc-700 shrink-0" />;
                    }

                    return (
                      <div 
                        key={dept.id}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all duration-300 ${
                          idx === activeIdx 
                            ? 'border-[#d4af37] shadow-lg shadow-[#d4af37]/5 bg-[#121214] scale-[1.01]' 
                            : 'border-gray-900 bg-gray-950/40'
                        }`}
                      >
                        {/* Circle badge with dynamic color indicators */}
                        <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-850 shrink-0 mt-0.5">
                          {dept.icon}
                        </div>

                        <div className="space-y-1 flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-[12px] font-bold text-white truncate leading-tight">
                              {dept.name}
                            </h5>
                            <span className="text-[9px] font-mono font-semibold text-gray-500 shrink-0">{dept.code}</span>
                          </div>
                          
                          <p className="text-[10px] text-gray-500 leading-normal truncate">
                            {dept.floorZone} &bull; Lead: {dept.leadPerson}
                          </p>

                          {/* Render the core Status badge for "In Progress" | "Started" | "Not Started Yet" */}
                          <div className="flex items-center gap-2 pt-2.5">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border flex items-center gap-1.5 ${statusColor}`}>
                              {stepIndicatorNode}
                              {statusLabel}
                            </span>

                            {idx === activeIdx && (
                              <span className="text-[9px] text-[#f3e5ab] font-bold animate-pulse">
                                [{activeDeptLayout?.subStatus || 'Active Process'}]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chain of Custody Timeline Activity Log */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-850">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#f3e5ab] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#d4af37]" /> Bag Custodian Handoff Logs
                  </h4>
                  <span className="text-[9px] font-mono text-gray-500">Chain of Custody Traced</span>
                </div>

                <div className="relative border-l-2 border-gray-850 pl-5 ml-3 space-y-4.5 py-2.5 text-xs">
                  {localSelectedJob.timeline && localSelectedJob.timeline.map((evt: any, i: number) => (
                    <div key={i} className="relative group">
                      {/* Active checkpoint dot */}
                      <span className="absolute -left-[27px] top-1 bg-gray-950 border-2 border-amber-500/60 w-3 h-3 rounded-full flex items-center justify-center group-hover:border-amber-400 transition">
                        <span className="w-1 h-1 rounded-full bg-[#d4af37] animate-pulse" />
                      </span>
                      <div className="flex justify-between items-start gap-4">
                        <div className="text-left">
                          <span className="font-extrabold text-white text-[12px] tracking-wide uppercase">
                            {evt.status} Verified Handoff
                          </span>
                          <span className="mx-2 text-[10px] text-amber-400 font-mono bg-amber-950/20 px-2 py-0.2 rounded border border-amber-900/35 font-bold">
                            [{evt.payload}]
                          </span>
                          <p className="text-[11px] text-gray-400 mt-1 italic">
                            Custodian: <span className="text-gray-300 font-semibold">{evt.user}</span>
                          </p>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono tracking-wider shrink-0 bg-gray-950 px-2 py-1 rounded border border-gray-850">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Root initialization entry */}
                  <div className="relative">
                    <span className="absolute -left-[27px] top-1 bg-gray-950 border-2 border-emerald-500/60 w-3 h-3 rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <div className="flex justify-between items-start gap-4 text-left">
                      <div>
                        <span className="font-extrabold text-gray-400 text-[11px] uppercase">Barcode Registered & Pouch Released</span>
                        <p className="text-[10px] text-gray-500 italic mt-0.5">Admin Management Terminal Port</p>
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono">Initialized Spot</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra context informational alert banner */}
              <div className="p-4 bg-gray-950/50 border border-gray-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <Bookmark className="w-4.5 h-4.5 text-[#d4af37] shrink-0" />
                  <span className="leading-relaxed">
                    Physical envelope contains raw gem crystals and alloy weight envelopes labeled <b>{localSelectedJob.id}</b>.
                  </span>
                </div>
                {onSelectEmployee && localSelectedJob.assignedEmployeeId && (
                  <button
                    type="button"
                    onClick={() => onSelectEmployee(localSelectedJob.assignedEmployeeId)}
                    className="p-2 px-4 bg-gray-900 hover:bg-gray-800 text-[#d4af37] border border-[#d4af37]/35 hover:border-[#d4af37] rounded-xl text-xs font-bold transition shrink-0 uppercase tracking-wider"
                  >
                    Locate Lead artisan bench
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center space-y-4 bg-[#121214]/95 border border-gray-900 rounded-3xl shadow-xl">
              <div className="p-4 bg-gray-950 border border-gray-850 rounded-2xl">
                <MapPin className="w-10 h-10 text-[#d4af37] animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white uppercase tracking-wider">No Job bag loaded in scope</h4>
                <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto">
                  Insert your job bag's physical ID in the tracking search box or tap an index on the sidebar catalog list.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
