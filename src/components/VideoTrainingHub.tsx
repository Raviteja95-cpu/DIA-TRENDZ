import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  HelpCircle, 
  BookOpen, 
  Award, 
  Shield, 
  Users, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  Hammer, 
  FileText, 
  Sparkles, 
  CheckSquare,
  Bookmark,
  Volume2,
  VolumeX,
  Music,
  Tv,
  Subtitles,
  Info,
  Clock,
  RotateCcw,
  Sliders,
  ChevronRight,
  Sparkle
} from 'lucide-react';

interface SubtitleSegment {
  timeStart: number; // in seconds
  timeEnd: number;   // in seconds
  subtitle: string;
  narratorText: string;
  slideTitle: string;
  roleContext: 'welcome' | 'super' | 'admin' | 'employee' | 'qc';
  visualMarkup: React.ReactNode;
}

export default function VideoTrainingHub() {
  const [activeTab, setActiveTab] = useState<'video' | 'playbooks' | 'quiz'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Custom audio configuration controls
  const [isSynthBgmOn, setIsSynthBgmOn] = useState<boolean>(true);
  const [isVoiceOverOn, setIsVoiceOverOn] = useState<boolean>(true);
  
  // Playback timeline parameters (Max 120 seconds tutorial)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const totalDuration = 120; // 2 minutes

  // Quiz states
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizSelectedAns, setQuizSelectedAns] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [certifiedName, setCertifiedName] = useState<string>('');
  const [certificateIssued, setCertificateIssued] = useState<boolean>(false);

  // Web Audio Synthesizer references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const speechUtteranceRef = useRef<any>(null);
  const lastSpokenSegmentIdx = useRef<number>(-1);

  // Video subtitles database with custom styled mockup screens representing exact workflows
  const STAGES_TIMELINE: SubtitleSegment[] = [
    {
      timeStart: 0,
      timeEnd: 15,
      slideTitle: "✦ 1080p Interactive Presentation: Welcome ✦",
      roleContext: 'welcome',
      subtitle: "Welcome to Dia Trendz! This elegant full-stack platform optimizes tracking and completely eliminates raw metal losses.",
      narratorText: "Welcome to the Dia Trendz guide. This elegant platform is built with one clear mission: to optimize high-precision jewelry workflows, safeguard our precious gold assets, and keep every roll of paperwork in sync. Let us learn how it works in less than three minutes.",
      visualMarkup: (
        <div className="space-y-4 text-center animate-fadeIn">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-[#d4af37] text-[10px] uppercase font-mono font-bold rounded-full border border-amber-500/35">
            <Sparkle className="w-3 h-3 text-amber-400 animate-spin" /> High-Fidelity Client-Ready Showcase
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-tight">
            Dia Trendz Jewelers
          </h2>
          <p className="text-xs text-amber-200/80 font-mono tracking-widest uppercase">
            ✦ Unified Loss-Prevention Dashboard ✦
          </p>
          <div className="p-4 bg-slate-950/80 border border-gray-900 rounded-2xl max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between font-mono text-[10px] text-gray-500">
              <span>Platform Version: 4.1.0 (Stable)</span>
              <span>Status: Active Stream</span>
            </div>
            <p className="text-gray-300 text-left font-sans">
              Our floor system tracks raw diamonds, alloy weights, and labor hours over 8 steps from design blueprint to high-security delivery safe.
            </p>
          </div>
        </div>
      )
    },
    {
      timeStart: 15,
      timeEnd: 40,
      slideTitle: "✦ Role Walkthrough: 1. Super Admin Suite ✦",
      roleContext: 'super',
      subtitle: "The Super Admin secures our database files, views immutable audit logs, and monitors running system tests.",
      narratorText: "First, let us explore the Super Admin panel. As Super Admin, you hold master control over our data ledger. In your dashboard, you can view live security audit logs detailing every single action on the floor. Most importantly, you can download safe database snapshots as backups or run the Automated Testing suite to instantly certify loss calculations.",
      visualMarkup: (
        <div className="space-y-3 w-full max-w-lg text-left animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
              Super Admin View
            </span>
          </div>

          <h3 className="text-sm font-serif font-bold text-white">Universal Integrity Controls</h3>
          
          <div className="p-3.5 bg-black/70 border border-blue-900/40 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-blue-400 border-b border-gray-900 pb-1.5">
              <span>ACTIVE SYSTEM REGISTRY</span>
              <span className="text-emerald-400">● RUNNING OK</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[10px] font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Database File Snapshot:</span>
                <span className="text-white">db.json (Backed up)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Security Integrity Key:</span>
                <span className="text-white">AES-256 Registered</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Active Testing Suite:</span>
                <span className="text-emerald-400 font-bold">14/14 Codes Green ✓</span>
              </div>
            </div>

            <div className="pt-2 flex gap-1.5 justify-end">
              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-500 text-white leading-none">
                Export Raw DB
              </span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-900 text-gray-400 border border-gray-800 leading-none">
                Toggle Testing
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      timeStart: 40,
      timeEnd: 65,
      slideTitle: "✦ Role Walkthrough: 2. Manager / Admin Suite ✦",
      roleContext: 'admin',
      subtitle: "The Admin generates tracking pouches (Job Bags), allocates diamonds to bench keys, and tracks leaves.",
      narratorText: "Second is the Floor Manager or Admin interface. As Admin, you dispatch the active orders. Click ‘Create Job’ in the top workflow layout. Type the customer name, select the gold carat composition, and choose an eligible employee. You can also view the global leave calendar to check who is on vacation before assigning raw metal alloys.",
      visualMarkup: (
        <div className="space-y-3 w-full max-w-lg text-left animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#f3e5ab]">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#d4af37]/10 text-[#f3e5ab] px-2 py-0.5 rounded border border-[#d4af37]/10">
              Admin & Dispatcher View
            </span>
          </div>

          <h3 className="text-sm font-serif font-bold text-white">Generate Tracking Pouches (Job Bags)</h3>
          
          <div className="p-3.5 bg-black/70 border border-gray-900 rounded-xl space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="space-y-1">
                <span className="text-gray-500">POUCH ID & TARGET CLIENT</span>
                <div className="p-1.5 bg-zinc-900 text-white rounded border border-gray-800">
                  JOB-101 (Imperial Diamond Crown)
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500">ASSIGN BENCH ARTISAN</span>
                <div className="p-1.5 bg-zinc-900 text-amber-400 rounded border border-gray-800 font-bold">
                  Rajesh Kumar (Diamond Setter)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="space-y-1">
                <span className="text-gray-500">RAW GOLD ALLOY WEIGHT</span>
                <div className="p-1.5 bg-zinc-900 text-white rounded border border-gray-800">
                  14.2 Grams (18K Gold)
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500">SATELLITE LEAVE PLANNER</span>
                <div className="p-1.5 bg-slate-900 text-emerald-400 rounded border border-gray-800 font-bold">
                  Schedules Checked OK
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      timeStart: 65,
      timeEnd: 95,
      slideTitle: "✦ Role Walkthrough: 3. Artisan & Employee Desk ✦",
      roleContext: 'employee',
      subtitle: "Artisans review assigned bags, record raw gold weight values, and toggle start-and-pause labor timers.",
      narratorText: "Third, let's explore the human-friendly Employee and workbench view. When our gold polishers or gem setters sit down at their physical bench, they can log in using their simplified password, test at 123. They see only their assigned workloads. Just click ‘Accept Assigned Bag’, and the live timer starts recording. When leaving for a lunch break, just hit pause to capture downtime accurately.",
      visualMarkup: (
        <div className="space-y-3 w-full max-w-lg text-left animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Hammer className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
              Artisan Bench View
            </span>
          </div>

          <h3 className="text-sm font-serif font-bold text-white">Active Workbench Timer Portal</h3>
          
          <div className="p-3.5 bg-[#121214] border border-gray-850 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center bg-black/60 p-2.5 rounded-lg border border-gray-900">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Active Run: <b>Imperial Ring</b></span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                02:14:18 Live
              </span>
            </div>

            <div className="pt-1.5 flex gap-2 items-center justify-between">
              <div className="text-[10px] font-mono">
                <span className="text-gray-500 block">WEIGH SCALE INPUT:</span>
                <span className="text-white font-bold text-xs">14.18 Grams Left</span>
              </div>
              <div className="flex gap-1.5">
                <button className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-mono font-bold uppercase transition">
                  Pause Block
                </button>
                <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono font-bold uppercase transition">
                  Submit Weight
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      timeStart: 95,
      timeEnd: 120,
      slideTitle: "✦ Steps 7 & 8: Spectroscopy QC & Secure Vault ✦",
      roleContext: 'qc',
      subtitle: "The QC specialist runs spectroscopic alloy checks, prints laser hallmark certificates, and locks the item in the secure vault.",
      narratorText: "Finally, we reach the quality checks and storage handovers. The Quality inspector logins to scan karats. If it passes spectrometry check, we stamp the gold hallmark seal. Otherwise, we press the rework button, and the job bag card automatically slides back to the artisan workbench with management notes. The finished custom piece has its final velvet wrapping, gets its high-security barcode registered, and is locked in Step 8 steel vault.",
      visualMarkup: (
        <div className="space-y-3 w-full max-w-lg text-left animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
              Quality Assurance & Vault Handoff
            </span>
          </div>

          <h3 className="text-sm font-serif font-bold text-white">Carat Scanner & Hallmark Seals</h3>
          
          <div className="p-3.5 bg-black/70 border border-gray-900 rounded-xl space-y-2">
            <div className="p-2 bg-[#121214] rounded border border-purple-900/40 text-[10px] font-mono flex items-center justify-between">
              <span className="text-gray-400">X-Ray Carat Spectroscopy:</span>
              <span className="text-[#d4af37] font-bold">18.01K Gold Certified ✓</span>
            </div>

            <div className="p-2 bg-[#121214] rounded border border-gray-900 text-[10px] font-mono flex items-center justify-between">
              <span className="text-gray-400">Step 8: Final Destination Steel Vault</span>
              <span className="text-emerald-400 font-bold uppercase">Locked Safe</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Helper function to get the current subtitle frame based on currentTime
  const getCurrentFrameIndex = () => {
    const idx = STAGES_TIMELINE.findIndex(item => currentTime >= item.timeStart && currentTime < item.timeEnd);
    return idx === -1 ? STAGES_TIMELINE.length - 1 : idx;
  };

  const currentFrameIdx = getCurrentFrameIndex();
  const currentFrame = STAGES_TIMELINE[currentFrameIdx];

  // Synthesize soft ambient drone and chord loops using Web Audio API
  const startBgmSynth = () => {
    if (synthIntervalRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const chords = [
        [196.00, 246.94, 293.66, 392.00], // G major chord notes (G3, B3, D4, G4)
        [174.61, 220.00, 261.63, 349.23], // F major chord notes (F3, A3, C4, F4)
        [220.00, 261.63, 329.63, 440.00], // A minor chord notes (A3, C4, E4, A4)
        [196.00, 246.94, 329.63, 392.00]  // E minor7 chord notes
      ];

      let chordIdx = 0;

      const playChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended' || !isSynthBgmOn) return;
        const now = audioCtxRef.current.currentTime;
        const chordNotes = chords[chordIdx % chords.length];
        chordIdx++;

        chordNotes.forEach((freq) => {
          const osc = audioCtxRef.current!.createOscillator();
          const gainNode = audioCtxRef.current!.createGain();
          const panner = audioCtxRef.current!.createStereoPanner ? audioCtxRef.current!.createStereoPanner() : null;

          osc.type = 'triangle'; // triangle is much softer and melodic
          osc.frequency.setValueAtTime(freq, now);

          // Build a soothing slow-attack envelope
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.015, now + 1.2); // incredibly soft, professional background loop
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

          if (panner) {
            panner.pan.setValueAtTime((Math.random() * 0.6 - 0.3), now);
            osc.connect(panner);
            panner.connect(gainNode);
          } else {
            osc.connect(gainNode);
          }

          gainNode.connect(audioCtxRef.current!.destination);

          osc.start(now);
          osc.stop(now + 6);
        });
      };

      playChord();
      synthIntervalRef.current = setInterval(playChord, 5000);
    } catch (e) {
      console.warn("Speech synthesis or web audio synthesis not supported in this frame context.");
    }
  };

  const stopBgmSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  // Speaks aloud using speech synthesis API
  const speakNarrator = (text: string) => {
    if (!isVoiceOverOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Auto-assign any clear female voice with melodic cadence
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('google us english') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('hazel') ||
        v.name.toLowerCase().includes('susan') ||
        v.name.toLowerCase().includes('natural')
      );
      
      if (preferred) {
        utterance.voice = preferred;
      }
      utterance.pitch = 1.2; // soft high pitch for professional melodic AI female voice-over
      utterance.rate = 1.0;  // steady speed
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  // Automatic slide progress tracking hook
  useEffect(() => {
    let playTimer: any = null;
    if (isPlaying) {
      // Initialize Synthesized chimes if on
      if (isSynthBgmOn && !audioCtxRef.current) {
        startBgmSynth();
      }

      playTimer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration - 1) {
            return 0; // Loop presentation
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      stopBgmSynth();
    }

    return () => {
      clearInterval(playTimer);
    };
  }, [isPlaying, isSynthBgmOn]);

  // Hook watching for chapter frame changes to trigger Speech Narration
  useEffect(() => {
    if (isPlaying && isVoiceOverOn) {
      if (lastSpokenSegmentIdx.current !== currentFrameIdx) {
        speakNarrator(currentFrame.narratorText);
        lastSpokenSegmentIdx.current = currentFrameIdx;
      }
    }
  }, [currentFrameIdx, isPlaying, isVoiceOverOn]);

  // Resume context if audio was blocked by browser autoplay constraints
  const handleTogglePlay = () => {
    if (window.speechSynthesis && !isPlaying) {
      window.speechSynthesis.resume();
    }
    
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (sec: number) => {
    setCurrentTime(sec);
    // immediately trigger speaking of that slide
    if (isVoiceOverOn) {
      const targetIdx = STAGES_TIMELINE.findIndex(item => sec >= item.timeStart && sec < item.timeEnd);
      if (targetIdx !== -1) {
        speakNarrator(STAGES_TIMELINE[targetIdx].narratorText);
        lastSpokenSegmentIdx.current = targetIdx;
      }
    }
  };

  // Quiz helper locked answers
  const handleSelectAnswer = (idx: number) => {
    if (quizAnswered) return;
    setQuizSelectedAns(idx);
  };

  const handleSubmitQuizAnswer = () => {
    if (quizSelectedAns === null) return;
    setQuizAnswered(true);
    if (quizSelectedAns === QUIZ_QUESTIONS[currentQuizIdx].correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelectedAns(null);
    setQuizAnswered(false);
    if (currentQuizIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizSelectedAns(null);
    setQuizAnswered(false);
    setCertificateIssued(false);
    setCertifiedName('');
  };

  // Simple quiz database oriented around gold safety guidelines
  const QUIZ_QUESTIONS = [
    {
      question: "Which employee login credential provides quick access to run active workbench times?",
      options: [
        "Email: admin@gmail.com, Password: Admin@123",
        "Email: rajesh@diatrendz.com, Password: test@123",
        "Email: guest@guest.com, Password: Password",
        "No login is needed on physical benches"
      ],
      correctIdx: 1,
      explanation: "Superb! राजेश (rajesh@diatrendz.com) and other artisans use test@123 as their universal testing password."
    },
    {
      question: "Why does the workbench artisan type the physical scale gold weight at checkout?",
      options: [
        "To check the diamond carat settings of another employee.",
        "To calculate exact gold shaving losses immediately, enforcing zero metal loss.",
        "Because of system backup server requirements.",
        "To view the current holiday calendar."
      ],
      correctIdx: 1,
      explanation: "Spot-on! By typing the physical scale gold weight, the system computes the exact loss to protect precious assets."
    },
    {
      question: "Which step is responsible for non-destructive X-Ray carat check and laser etching?",
      options: [
        "Step 1: Designing Blueprint desk",
        "Step 3: Crucible Foundry Melting",
        "Step 7: Spectroscopy Gold Purity & Hallmark Check",
        "Step 8: Handoff Vault storage"
      ],
      correctIdx: 2,
      explanation: "Excellent! The QC specialist scans gold purities and prints official hallmark logos at Step 7 before delivering to the Safe Vault."
    }
  ];

  return (
    <div className="space-y-6 text-left" id="visual-training-center">
      
      {/* Sleek Golden Broadcast Banner */}
      <div className="p-6 bg-gradient-to-r from-[#030712] via-[#0b1424] to-[#01040a] rounded-2xl border border-[#d4af37]/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-amber-500">
               Live 1080p Interactive Video Tutorial
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-serif font-bold text-white tracking-wide">
            Dia Trendz Studio Instruction Hub
          </h1>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Beautiful step-by-step role demonstrations created for business presentations. Hear dynamic narration and lo-fi chimes synthesized right inside your browser!
          </p>
        </div>

        {/* Tab Selection panel */}
        <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`p-2.5 px-3.5 rounded-xl uppercase font-bold transition cursor-pointer ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38e1a] text-black border border-amber-500'
                : 'bg-zinc-950 text-gray-400 hover:text-white border border-gray-900'
            }`}
          >
            📽 Play Presentation
          </button>
          
          <button
            onClick={() => setActiveTab('quiz')}
            className={`p-2.5 px-3.5 rounded-xl uppercase font-bold transition cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38e1a] text-black border border-amber-500'
                : 'bg-zinc-950 text-gray-400 hover:text-white border border-gray-900'
            }`}
          >
            🏆 Take Staff Test
          </button>
        </div>
      </div>

      {/* Main Broadcast Player Section */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* HD 1080p Simulated Screen Block */}
          <div className="lg:col-span-8 bg-black border border-gray-900 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col justify-between aspect-video select-none" id="hd-cinematic-monitor">
            
            {/* Top informational header bar overlay */}
            <div className="p-3 bg-zinc-950/90 border-b border-gray-900 flex items-center justify-between text-[10px] font-mono text-gray-400 z-10">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /> SCREEN REC 1080P
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-300 uppercase tracking-widest">{currentFrame.slideTitle}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-zinc-900 px-2 py-0.5 rounded text-[9px] text-gray-500 font-extrabold">H.264 AAC</span>
                <span className="text-gray-500">Vol: 100%</span>
              </div>
            </div>

            {/* Simulated Live Visual Canvas Frame */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-0 min-h-[180px]">
              
              {/* Background gradient color themes tied directly to role context */}
              <div className={`absolute inset-0 transition-all duration-700 bg-gradient-to-md opacity-35 filter blur-3xl ${
                currentFrame.roleContext === 'welcome' ? 'from-amber-950/30 to-slate-950' :
                currentFrame.roleContext === 'super' ? 'from-blue-950/40 to-slate-950' :
                currentFrame.roleContext === 'admin' ? 'from-amber-900/30 to-slate-950' :
                currentFrame.roleContext === 'employee' ? 'from-emerald-950/30 to-slate-950' :
                'from-purple-950/40 to-slate-950'
              }`} />

              <div className="absolute inset-0 bg-black/90 pointer-events-none z-[-1]" />

              {/* Live Rendered Visual Content block representing active role */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full">
                {currentFrame.visualMarkup}
              </div>
            </div>

            {/* Dynamic Synchronized Subtitles Area (Professional lower-third option) */}
            <div className="px-5 py-4 bg-zinc-950/95 border-t border-gray-900/80 min-h-[72px] flex items-center justify-center text-center z-10 relative">
              <div className="absolute top-1 left-3 flex items-center gap-1">
                <Subtitles className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-[8px] tracking-wider text-gray-600 uppercase font-mono font-bold">English CC Subtitle Feed</span>
              </div>
              <p className="text-xs text-[#f3e5ab] font-sans leading-relaxed tracking-wide max-w-xl text-center">
                "{currentFrame.subtitle}"
              </p>
            </div>

            {/* Custom Interactive Seeker Bar */}
            <div className="bg-zinc-950 px-4 pt-1 z-10 relative">
              <div className="relative h-1 w-full bg-gray-900 rounded-full cursor-pointer" 
                   onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pct = (e.clientX - rect.left) / rect.width;
                     handleSeek(Math.floor(pct * totalDuration));
                   }}>
                <div 
                  className="absolute left-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
                <div 
                  className="absolute h-3 w-3 bg-white border border-amber-500 rounded-full -top-1 shadow cursor-pointer transition-all duration-300"
                  style={{ left: `calc(${(currentTime / totalDuration) * 100}% - 6px)` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-gray-500 pt-1.5 pb-1">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                <span>Tutorial Run Time (2:00 Max)</span>
                <span>2:00</span>
              </div>
            </div>

            {/* Video Controls & Audio Settings Panel */}
            <div className="p-4 bg-zinc-950 border-t border-gray-900 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono z-10">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 bg-[#d4af37] text-black font-extrabold rounded-xl hover:bg-amber-400 transition cursor-pointer flex items-center gap-1 shadow-lg"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 bg-zinc-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition cursor-pointer"
                  title="Rewind"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="text-gray-500 text-[10px] hidden sm:block">
                  <span>CHAPTER: {currentFrame.roleContext.toUpperCase()}</span>
                </div>
              </div>

              {/* Sub-Audio Synthesizer controls */}
              <div className="flex items-center gap-2">
                
                {/* Voice Narration control */}
                <button
                  onClick={() => {
                    const nextVal = !isVoiceOverOn;
                    setIsVoiceOverOn(nextVal);
                    if (!nextVal && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    } else if (nextVal && isPlaying) {
                      speakNarrator(currentFrame.narratorText);
                    }
                  }}
                  className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 transition cursor-pointer text-[10px] font-bold uppercase ${
                    isVoiceOverOn 
                      ? 'bg-amber-500/10 border-amber-500 text-[#f3e5ab]' 
                      : 'bg-zinc-900/60 border-zinc-900 text-gray-500'
                  }`}
                  title="Toggle synthesised artificial voice narrator overlay"
                >
                  {isVoiceOverOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-600" />}
                  <span>Voice Narration</span>
                </button>

                {/* Lo-Fi Background Synthesizer control */}
                <button
                  onClick={() => {
                    const nextVal = !isSynthBgmOn;
                    setIsSynthBgmOn(nextVal);
                    if (!nextVal) {
                      stopBgmSynth();
                    } else if (nextVal && isPlaying) {
                      startBgmSynth();
                    }
                  }}
                  className={`p-2 px-3 rounded-xl border flex items-center gap-1.5 transition cursor-pointer text-[10px] font-bold uppercase ${
                    isSynthBgmOn 
                      ? 'bg-amber-500/10 border-amber-500 text-[#f3e5ab]' 
                      : 'bg-zinc-900/60 border-zinc-900 text-gray-500'
                  }`}
                  title="Toggle physical web audio synthesised music drone"
                >
                  <Music className={`w-3.5 h-3.5 ${isSynthBgmOn ? 'text-amber-400 animate-pulse' : 'text-gray-600'}`} />
                  <span>Lo-Fi Synth Music</span>
                </button>

              </div>

            </div>

          </div>

          {/* Quick Chapter Selection Sidebar panel */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 bg-gradient-to-br from-[#0c1220] via-[#05080f] to-black border border-gray-900 rounded-2xl space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-[#f3e5ab] tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#d4af37]" /> Interactive Video Chapters
              </h3>

              <div className="space-y-2">
                {STAGES_TIMELINE.map((item, idx) => {
                  const isActive = currentFrameIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSeek(item.timeStart)}
                      className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between border cursor-pointer ${
                        isActive 
                          ? 'bg-amber-500/10 border-[#d4af37] text-white' 
                          : 'bg-black/40 border-transparent hover:border-gray-800 text-gray-400 hover:text-white'
                      }`}
                      id={`chapter-link-${idx}`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-medium block capitalize tracking-wide text-gray-150">
                          {item.slideTitle.split(':').pop()?.replace('✦', '')}
                        </span>
                        <span className="text-[8px] font-mono text-gray-500 uppercase">
                          Starts at 0:{item.timeStart.toString().padStart(2, '0')} sec
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-[#d4af37] ${isActive ? 'translate-x-1' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quickstart passcodes cheatsheet block */}
            <div className="p-4 bg-[#121214]/60 border border-gray-900 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-widest flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#d4af37]" /> Client-Ready Credentials Cheat
              </h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Use these mock combinations inside the login portal to immediately demonstrate the screens covered in the tutorial. Every role has its password set simple to <b>test@123</b> (Except the SuperAdmin which has <b>Admin@123</b>):
              </p>
              
              <div className="space-y-1.5 text-[10px] font-mono text-gray-300">
                <div className="p-2 bg-black/60 rounded border border-gray-900 justify-between flex">
                  <span className="text-blue-400 font-bold">1. Super Admin:</span>
                  <span>admin@gmail.com / Admin@123</span>
                </div>
                <div className="p-2 bg-black/60 rounded border border-gray-900 justify-between flex">
                  <span className="text-amber-400 font-bold">2. Regular Admin:</span>
                  <span>lead@diatrendz.com / test@123</span>
                </div>
                <div className="p-2 bg-black/60 rounded border border-gray-900 justify-between flex">
                  <span className="text-emerald-400 font-bold">3. Workbench Artisan:</span>
                  <span>rajesh@diatrendz.com / test@123</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Certification Quiz Section */}
      {activeTab === 'quiz' && (
        <div className="p-6 bg-[#0a0f1d]/95 rounded-2xl border border-gray-900 max-w-2xl mx-auto space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-gray-900 pb-3">
            <Award className="w-5 h-5 text-amber-400 text-xl" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Dia Trendz Jeweler Proficiency Assessment
            </h2>
          </div>

          {!quizCompleted ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-gray-900 font-bold">
                <span>QUESTION {currentQuizIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
                <span className="text-amber-400">SCORE: {quizScore}</span>
              </div>

              <h3 className="text-xs sm:text-sm font-serif font-bold text-white leading-relaxed">
                {QUIZ_QUESTIONS[currentQuizIdx].question}
              </h3>

              <div className="space-y-2 pt-2">
                {QUIZ_QUESTIONS[currentQuizIdx].options.map((opt, idx) => {
                  const isSelected = quizSelectedAns === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`w-full text-left p-3.5 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg' 
                          : 'bg-black/50 border-gray-900 text-gray-300 hover:border-gray-800'
                      }`}
                      id={`quiz-option-interactive-${idx}`}
                    >
                      <span className="font-sans leading-relaxed">{opt}</span>
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="p-4 bg-zinc-900/90 rounded-xl border border-gray-850 text-xs space-y-2 animate-fadeIn text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-extrabold uppercase text-[10px] ${
                      quizSelectedAns === QUIZ_QUESTIONS[currentQuizIdx].correctIdx ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {quizSelectedAns === QUIZ_QUESTIONS[currentQuizIdx].correctIdx ? '✓ Response Correct!' : '✗ Response Incorrect'}
                    </span>
                  </div>
                  <p className="text-gray-300 font-sans leading-normal">
                    {QUIZ_QUESTIONS[currentQuizIdx].explanation}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                {!quizAnswered ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={quizSelectedAns === null}
                    className="p-3 px-6 bg-[#d4af37] text-black font-bold font-mono text-[10px] uppercase tracking-wider rounded-xl hover:bg-amber-400 disabled:opacity-40 transition cursor-pointer"
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="p-3 px-6 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold font-mono text-[10px] uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer animate-pulse"
                  >
                    <span>Proceed Forward</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-5">
              <div className="p-4 bg-amber-500/10 text-[#d4af37] border border-amber-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Award className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-white">Assessment Completed!</h3>
                <p className="text-xs text-gray-400">
                  You successfully certified <b>{quizScore} out of {QUIZ_QUESTIONS.length}</b> correct benchmarks.
                </p>
              </div>

              {quizScore >= 2 ? (
                <div className="p-5 bg-[#0b1424] border border-blue-900/40 rounded-2xl max-w-md mx-auto space-y-4">
                  <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-3 py-1 rounded border border-blue-900/20 font-bold block w-max mx-auto">
                    Gold Ledger certified safe status
                  </span>
                  <p className="text-xs text-gray-300">
                    Input the manager or client name below to print the official <b>Proficiency Seal</b>:
                  </p>
                  
                  {!certificateIssued ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={certifiedName}
                        onChange={(e) => setCertifiedName(e.target.value)}
                        placeholder="E.g. Dia Trendz Partner"
                        className="flex-1 bg-black/60 border border-gray-900 rounded-xl text-xs p-3 text-white placeholder-gray-600 focus:outline-none"
                      />
                      <button
                        onClick={() => { if(certifiedName.trim()) setCertificateIssued(true); }}
                        className="p-3 bg-[#d4af37] text-black font-mono text-[10px] uppercase font-bold rounded-xl hover:bg-amber-400 transition cursor-pointer"
                      >
                        Issue Stamp
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4 text-center font-serif relative overflow-hidden" id="proficiency-certificate-visual-seal">
                      <div className="absolute top-0 right-0 p-1.5 bg-amber-500/10 text-[#d4af37] text-[7px] font-mono border-b border-l border-amber-500/20">
                        OFFICIAL KEY
                      </div>
                      <div className="text-[11px] tracking-widest uppercase text-amber-500 font-bold">CERTIFICATE OF LEDGER PROFICIENCY</div>
                      <div className="text-xl font-bold text-white">{certifiedName}</div>
                      <div className="text-[10px] text-gray-400 font-sans leading-relaxed">
                        Is hereby certified to have read and fully understood the 8 production steps of the Dia Trendz facility, confirming proper workbench safety workflows.
                      </div>
                      <div className="text-[9px] text-[#f3e5ab] font-mono uppercase border-t border-gray-900 pt-3 flex justify-between">
                        <span>CERT ID: DIA-COMP-{Math.floor(1000 + Math.random() * 9000)}</span>
                        <span>STATUS: ACTIVE LEDGER SAFETY PASS</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl max-w-sm mx-auto text-xs text-red-300">
                  Please score at least 2 correct answers to unlock your Ledger Gold Pass.
                </div>
              )}

              <button
                onClick={handleResetQuiz}
                className="p-2.5 px-5 bg-zinc-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition block mx-auto cursor-pointer"
              >
                Reset & Restart Quiz
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
