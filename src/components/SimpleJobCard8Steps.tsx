import React, { useState } from 'react';
import { 
  Layers, 
  Binary, 
  Flame, 
  Grid, 
  Hammer, 
  Activity, 
  CheckCircle, 
  Container, 
  Shield, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  HelpCircle,
  HelpCircle as InfoIcon
} from 'lucide-react';

interface GuideStep {
  id: string;
  stepNumber: number;
  code: string;
  title: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  superAdminAction: string;
  adminAction: string;
  artisanAction: string;
  floorZone: string;
}

export default function SimpleJobCard8Steps() {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  const STEPS: GuideStep[] = [
    {
      id: 'design',
      stepNumber: 1,
      code: 'DSN-01',
      title: 'Designing Desk & Blueprint',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      description: 'Hand sketches, metal weight projections, and digital scaling curves of the jewelry item.',
      superAdminAction: 'Audits design accuracy and registers the initial precious material budget.',
      adminAction: 'Assigns the approved sketch to CAD designers and schedules timelines.',
      artisanAction: 'Uploads design drawings and configures initial jewelry specification attributes.',
      floorZone: 'Zone A - Lead Creative Loft'
    },
    {
      id: 'cad',
      stepNumber: 2,
      code: 'CAD-02',
      title: 'Precision CAD Lab & 3D Wax',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      icon: <Binary className="w-5 h-5 text-teal-400" />,
      description: '3D mesh modeling in Rhinoceros, wax support printing, and high-precision resin cures.',
      superAdminAction: 'Verifies global CAD asset safety and inspects weight estimates.',
      adminAction: 'Reviews the 3D rendered model on the calendar and signs off to dispatch casting.',
      artisanAction: 'Builds digital resin files and prints the matching physical wax tree molds.',
      floorZone: 'Zone A - High Precision Tech Suite'
    },
    {
      id: 'alloy',
      stepNumber: 3,
      code: 'CST-03',
      title: 'Crucible Alloys & Melting',
      badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      description: 'Induction kiln heating of 18K/22K gold alloy gold bars under vacuum pressure.',
      superAdminAction: 'Initiates safe system-wide alloy density checks in hardware settings.',
      adminAction: 'Ensures casting raw gold is allocated with matching barcode signature sheets.',
      artisanAction: 'Melts alloys, cures the plaster casting sprues, and pours gold molds.',
      floorZone: 'Zone B - Hot Smelting Foundry'
    },
    {
      id: 'sorting',
      stepNumber: 4,
      code: 'SRT-04',
      title: 'Gem Sizing & Diamond Allocation',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: <Grid className="w-5 h-5 text-purple-400" />,
      description: 'Sieving accent diamonds, microscopic diamond grading, and assorting matching gems.',
      superAdminAction: 'Reviews VVS1-grade diamond import files and authenticates diamond certificates.',
      adminAction: 'Distributes raw diamond parcels to bench-artisans based on holiday schedules.',
      artisanAction: 'Measures carats, matches diamond color scales, and places them in secure trays.',
      floorZone: 'Zone B - Precision Sorting Lab'
    },
    {
      id: 'setting',
      stepNumber: 5,
      code: 'SET-05',
      title: 'Master Bench & Hand Setting',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <Hammer className="w-5 h-5 text-amber-400" />,
      description: 'Hand microscopic bead claw-locking, bezel punch setting, and secure frame tightening.',
      superAdminAction: 'Audits physical workbench signature history logs for loss-prevention checkups.',
      adminAction: 'Tracks active job bags and coordinates live handovers across workbench slots.',
      artisanAction: 'Accepts materials, starts timers, precision sets gems, and inputs scale weights.',
      floorZone: 'Zone C - Handcrafting Benches'
    },
    {
      id: 'polishing',
      stepNumber: 6,
      code: 'POL-06',
      title: 'High-Luster Mirror Buffing',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      icon: <Activity className="w-5 h-5 text-pink-400" />,
      description: 'Soft rotary buffing, ultrasonic detergent cleanses, and rhodium plating chemical dips.',
      superAdminAction: 'Analyzes overall workstation productivity scoring and polishing speed metrics.',
      adminAction: 'Manages gold shaving residue collection protocols to protect raw assets.',
      artisanAction: 'Smoothes precious metal surfaces of any scratches and polishes to a high mirror shine.',
      floorZone: 'Zone C - Wet Luster Lab'
    },
    {
      id: 'qc',
      stepNumber: 7,
      code: 'QCA-07',
      title: 'Spectroscopy Gold Purity Check',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      description: 'Spectroscopic alloy carat scanner diagnostics and optical laser hallmark engraving.',
      superAdminAction: 'Verifies certification algorithms in the automated testing suite.',
      adminAction: 'Re-routes unsuccessful quality bags back to artisans with specific reject task remarks.',
      artisanAction: 'Performs non-destructive carat testing and executes official hallmark engravings.',
      floorZone: 'Zone D - Dust-Free QA Room'
    },
    {
      id: 'vault',
      stepNumber: 8,
      code: 'VLT-08',
      title: 'Handoff Vault & Safe Storage',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: <Container className="w-5 h-5 text-indigo-400" />,
      description: 'Signature velvet wrapping, retail premium boxes packaging, and logistics barcode sign-offs.',
      superAdminAction: 'Flashes final secure ledger snapshot backups when a bag leaves the floor.',
      adminAction: 'Downloads final job handover dossiers and schedules customer collection.',
      artisanAction: 'Locks finished boxes in the security safe and logs out signature barcodes.',
      floorZone: 'Zone D - High-Security Steel Vault'
    }
  ];

  return (
    <div className="border border-amber-500/30 bg-gradient-to-br from-[#0a1122] via-[#050914] to-[#010309] rounded-2xl overflow-hidden shadow-xl" id="universal-8step-master-card">
      
      {/* Interactive Title Card Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-slate-950/60 border-b border-gray-900 cursor-pointer hover:bg-slate-900/40 select-none"
      >
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#d4af37]" />
          <h3 className="text-xs font-mono font-bold uppercase text-[#f3e5ab] tracking-wider">
            ✦ Simple 8-Step Jewelry Design Workflow Master Guide ✦
          </h3>
          <span className="text-[9px] bg-amber-500/10 text-[#d4af37] px-2 py-0.5 rounded font-mono border border-amber-500/20">
            For All Roles
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-gray-500 text-[10px] hidden sm:inline">Click to Toggle View</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#d4af37]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#d4af37]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4 text-left">
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-b border-gray-900/60 pb-3">
             Below is our human-friendly 8-step roadmap representing the physical life of every custom jewelry order. Open it to find precise step actions mapped across <b>Super Admin</b>, <b>Admin</b>, and <b>Artisan</b> personnel levels.
          </p>

          {/* Stepper progress dots header */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pb-2">
            {STEPS.map((step, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(idx)}
                  className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isActive 
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-lg' 
                      : 'bg-black/40 border-gray-900 hover:border-gray-800 text-gray-500 hover:text-white'
                  }`}
                  id={`stepper-pill-${step.id}`}
                >
                  <span className="text-[10px] font-mono font-extrabold">{step.code}</span>
                  <div className="p-0.5 rounded bg-slate-900/60">
                    {step.icon}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed step contents focused on non-IT comprehension */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            
            {/* Left Description Pane */}
            <div className="md:col-span-5 bg-black/60 border border-gray-900 p-4 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-[#d4af37]/15 text-[#f3e5ab] px-2 py-0.5 rounded border border-[#d4af37]/20">
                    Step {STEPS[activeTab].stepNumber} of 8
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">
                    {STEPS[activeTab].floorZone}
                  </span>
                </div>
                
                <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                  {STEPS[activeTab].title}
                </h4>
                
                <p className="text-[11px] text-slate-300 leading-normal font-sans pt-1">
                  {STEPS[activeTab].description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-900/40 text-[9px] font-mono text-gray-500 uppercase flex justify-between">
                <span>Codebase Tag: {STEPS[activeTab].id}</span>
                <span>Active Status Check: Nominal</span>
              </div>
            </div>

            {/* Right Playbook Roles Pane */}
            <div className="md:col-span-7 space-y-3">
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-bold">
                👥 WHO DOES WHAT AT THIS STEP?
              </span>

              <div className="space-y-2 text-xs">
                
                {/* Super Admin Action Box */}
                <div className="p-3 bg-[#0d1630] border border-blue-900/40 rounded-xl flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 shrink-0 font-bold text-[9px] font-mono border border-blue-900/30">
                    SUPER
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-blue-300 font-mono font-semibold block uppercase">Owner / Super Admin:</span>
                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                      {STEPS[activeTab].superAdminAction}
                    </p>
                  </div>
                </div>

                {/* Admin Action Box */}
                <div className="p-3 bg-[#1d1406] border border-[#d4af37]/30 rounded-xl flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-yellow-950 text-[#d4af37] shrink-0 font-bold text-[9px] font-mono border border-amber-900/20">
                    ADMIN
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-300 font-mono font-semibold block uppercase">Floor Manager / Admin:</span>
                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                      {STEPS[activeTab].adminAction}
                    </p>
                  </div>
                </div>

                {/* Artisan Action Box */}
                <div className="p-3 bg-slate-900/40 border border-gray-850 rounded-xl flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 text-gray-400 shrink-0 font-bold text-[9px] font-mono border border-gray-900">
                    STAFF
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono font-semibold block uppercase">Artisan / Workbench Staff:</span>
                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                      {STEPS[activeTab].artisanAction}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
