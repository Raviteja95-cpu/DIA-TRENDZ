/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import {
  TrendingUp,
  Printer,
  Calendar,
  Users,
  Award,
  Clock,
  Gem,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  User,
  Activity,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';
import { JobCard, User as UserType } from '../types';

interface WorkReportsProps {
  currentUser: any;
  onSelectEmployee?: (emp: any) => void;
}

export function WorkReports({ currentUser, onSelectEmployee }: WorkReportsProps) {
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & selections state
  const [reportType, setReportType] = useState<'all-employees' | 'single-employee' | 'jewelry'>('all-employees');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // YYYY-MM format

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, tskRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/tasks')
      ]);
      if (empRes.ok && tskRes.ok) {
        const empList: UserType[] = await empRes.json();
        const tskList: JobCard[] = await tskRes.json();
        setEmployees(empList);
        setTasks(tskList);
      }
    } catch (err) {
      console.error('Error fetching reporting database:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe Date parsing & evaluation helper
  const taskMatchesDateFilter = (task: JobCard) => {
    if (!task.dueDate) return true;

    // We can extract dates from task.dueDate or task.timeline
    // Most system due dates are structured like "May 25, 2026" or "2026-05-25"
    let taskDate = new Date(task.dueDate);
    if (isNaN(taskDate.getTime())) {
      // Look fallback inside timeline stamps if present
      if (task.timeline && task.timeline.length > 0) {
        taskDate = new Date(task.timeline[0].timestamp);
      } else {
        return true; // if unparseable, keep it to ensure records aren't missing
      }
    }

    // Filter by specific Month (YYYY-MM)
    if (selectedMonth) {
      const year = taskDate.getFullYear();
      const month = String(taskDate.getMonth() + 1).padStart(2, '0');
      const taskYearMonth = `${year}-${month}`;
      if (taskYearMonth !== selectedMonth) {
        return false;
      }
    }

    return true;
  };

  const filteredTasks = tasks.filter(taskMatchesDateFilter);

  // Shortcut filters triggers
  const setQuickFilter = (type: 'this-month' | 'last-30' | 'all-time') => {
    const today = new Date();
    if (type === 'this-month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${year}-${month}`);
    } else {
      setSelectedMonth('');
    }
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle downloading PDF export
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Decorative Header Block
      doc.setFillColor(18, 18, 20); // Dark background #121214
      doc.rect(0, 0, pageWidth, 42, 'F');
      
      // Gold accent signature line
      doc.setFillColor(212, 175, 55); // Gold #d4af37
      doc.rect(0, 42, pageWidth, 2, 'F');

      doc.setTextColor(212, 175, 55); // Gold text
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("DIATRENDZ LUXURY ERP ANALYTICAL SHEET", 14, 15);

      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(22);
      let title = "MASTER WORKSHOP REPORT";
      if (reportType === 'single-employee') title = "SPECIALIST CRAFTSMAN DOSSIER";
      else if (reportType === 'jewelry') title = "JEWELRY METRICS & DISPATCH";
      doc.text(title, 14, 28);

      // Right aligned meta attributes
      doc.setTextColor(160, 160, 160); // Gray
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`DATE OF REPORT: ${new Date().toLocaleDateString()}`, pageWidth - 14, 15, { align: 'right' });
      doc.text(`BOUNDARY: ${selectedMonth ? selectedMonth : 'Cumulative History'}`, pageWidth - 14, 25, { align: 'right' });
      
      doc.setTextColor(0, 0, 0); // Reset text back to black
      
      // Import autotable dynamically to avoid missing types issues
      const autoTable = (await import('jspdf-autotable')).default;

      if (reportType === 'all-employees') {
        doc.setDrawColor(212, 175, 55); // Gold border stroke
        doc.setLineWidth(0.3);
        
        // Box 1
        doc.rect(14, 55, 87, 22, 'S');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.setFont("helvetica", "bold");
        doc.text("ACTIVE GOLD ALLOCATED / TOTAL WEIGHT", 18, 63);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${aggregateGramsGoldWeight(aggregateGramsOrFallback(aggregateGramsGolds))} g`, 18, 72);

        // Box 2
        doc.rect(106, 55, 89, 22, 'S');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("COMPLETED PRODUCTS / YIELD EFFICIENCY", 110, 63);
        doc.setFontSize(14);
        doc.setTextColor(0, 120, 0);
        doc.text(`${aggregateCompletedTasks} Items`, 110, 72);

        // Box 3
        doc.rect(14, 82, 87, 22, 'S');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("TIMELINES DELAY COUNT / ACTION LIMITS", 18, 90);
        doc.setFontSize(14);
        doc.setTextColor(200, 0, 0);
        doc.text(`${aggregateLateCount} Tardiness`, 18, 99);

        // Box 4
        doc.rect(106, 82, 89, 22, 'S');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("DISPATCH SUCCESS RATIO / ON-TIME COMPLIANCE", 110, 90);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        let sr = Math.round(((aggregateCompletedTasks - aggregateLateCount) / (aggregateCompletedTasks || 1)) * 100);
        doc.text(`${sr} %`, 110, 99);
        
        doc.setTextColor(0, 0, 0);
        
        const tableBody = employees.filter(e => e.role === 'EMPLOYEE').map(emp => {
          const empTasks = filteredTasks.filter(t => t.assignedEmployeeId === emp.id);
          const empActive = empTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
          const empCompleted = empTasks.filter(t => t.status === 'Completed').length;
          const empLate = empTasks.filter(t => t.status === 'Completed' && (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0)).length;
          let onTimeRate = empCompleted > 0 ? Math.round(((empCompleted - empLate) / empCompleted) * 100) : (emp.productivityScore || 100);
          return [emp.fullName, emp.id, emp.department || 'Assembly', empActive.toString(), empCompleted.toString(), empLate.toString(), `${onTimeRate}%`];
        });
        
        autoTable(doc, {
          startY: 115,
          head: [['Artisan Specialist', 'ID', 'Dept', 'Active Jobs', 'Completed', 'Delay Count', 'Accuracy']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [18, 18, 20], textColor: [212, 175, 55], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });
      } else if (reportType === 'single-employee' && activeEmployeeModel) {
        
        doc.setDrawColor(212, 175, 55); 
        doc.setLineWidth(0.3);

        // Left box (Artisan Meta)
        doc.rect(14, 55, 115, 30, 'S');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("ARTISAN NAME & CREDENTIAL", 18, 63);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(activeEmployeeModel.fullName.toUpperCase(), 18, 71);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`SECURE ID: ${activeEmployeeModel.id}  •  DEPT: ${activeEmployeeModel.department || 'GENERAL BENCH'}`, 18, 78);
        
        // Right box (Success Rate)
        doc.rect(135, 55, 60, 30, 'S');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("ON-TIME SUCCESS YIELD", 139, 63);
        doc.setFontSize(22);
        doc.setTextColor(212, 175, 55); // Gold
        doc.text(`${employeeSuccessRate}`, 139, 74);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("/ 100", 170, 74);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`JOBS HANDLED: ${employeeTasks.length}`, 139, 81);
        
        const tableBody = employeeTasks.map(t => {
           return [t.id, t.jewelryType, t.status, `${t.goldWeight} g`, `${t.estimatedTime} hr`, `${t.actualTime || 0} hr`, t.dueDate];
        });
        
        autoTable(doc, {
          startY: 95,
          head: [['Job ID', 'Target Type', 'Current Status', 'Allocated Gold', 'Est Hr', 'Actual Hr', 'Due Date']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [18, 18, 20], textColor: [212, 175, 55], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 }
        });
      } else if (reportType === 'jewelry') {
        
        doc.setDrawColor(212, 175, 55); 
        doc.setLineWidth(0.3);
        
        doc.rect(14, 55, pageWidth - 28, 25, 'S');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("CUMULATIVE ALLOY MATERIALS TRACKING (FINAL INCORPORATED WEIGHT)", 18, 63);
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(`${aggregateGramsGoldWeight(aggregateGramsOrFallback(aggregateGramsGolds))} GRAMS GOLD ALLOCATED`, 18, 73);
         
         const tableBody = jewelryStatsObj.map(group => [
            group.categoryName,
            `${group.count} Jobs`,
            `${group.goldWeight} g`,
            group.completedCount.toString(),
            group.lateCount.toString(),
            `${group.lateRate}%`
         ]);
         
         autoTable(doc, {
           startY: 90,
           head: [['Jewelry Design Group', 'Invoiced Items', 'Material Allocated', 'Completed Items', 'Late Items', 'Lateness Rate']],
           body: tableBody,
           theme: 'grid',
           headStyles: { fillColor: [18, 18, 20], textColor: [212, 175, 55], fontStyle: 'bold' },
           styles: { fontSize: 9, cellPadding: 3 }
         });
      }
      
      const pageEndHeight = doc.internal.pageSize.getHeight();
      
      // Final footer logic
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(14, pageEndHeight - 25, pageWidth - 14, pageEndHeight - 25);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("AUTHORITY APPROVER VERIFICATION: _______________________", 14, pageEndHeight - 15);
      doc.text("DIATRENDZ MANUFACTURING ERP SECURE AUDIT LOG", pageWidth - 14, pageEndHeight - 15, { align: 'right' });
      
      let fileName = `Diatrendz_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      if (reportType === 'single-employee' && activeEmployeeModel) {
        fileName = `Diatrendz_Employee_${activeEmployeeModel.id}_Report.pdf`;
      } else if (reportType === 'jewelry') {
        fileName = `Diatrendz_Jewelry_Report.pdf`;
      }
      
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF report.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate detailed Individual Employee stats
  let activeEmployeeModel = null;
  if (employeeSearchQuery.trim()) {
    activeEmployeeModel = employees.find(e => 
      e.id.toLowerCase() === employeeSearchQuery.toLowerCase() || 
      e.fullName.toLowerCase() === employeeSearchQuery.toLowerCase()
    );
  }
  
  const employeeTasks = activeEmployeeModel ? filteredTasks.filter(t => t.assignedEmployeeId === activeEmployeeModel.id) : [];
  const completedEmployeeTasks = employeeTasks.filter(t => t.status === 'Completed');

  // Success rate calculator:
  // Let's count a task as "Success (On-Time)" if actual fabrication hours are within the approved estimate limit (e.g. actualTime <= approvedTime).
  // Late is defined as completing it but exceeding hours or delayed flags.
  const lateEmployeeTasksCount = completedEmployeeTasks.filter(t => {
    const act = t.actualTime || 0;
    const appr = t.approvedTime || t.estimatedTime || 0;
    return act > appr;
  }).length;

  const onTimeCompletedCount = completedEmployeeTasks.length - lateEmployeeTasksCount;
  
  // Late Completion Success Rate
  // Out of 100
  let employeeSuccessRate = 100;
  if (completedEmployeeTasks.length > 0) {
    employeeSuccessRate = Math.round((onTimeCompletedCount / completedEmployeeTasks.length) * 100);
  } else if (activeEmployeeModel) {
    // Fallback to average productivity setting if they haven't solved completed tasks inside the current filter
    employeeSuccessRate = activeEmployeeModel.productivityScore || 100;
  }

  // General Summary stats
  const aggregateGramsGolds = filteredTasks.reduce((accum, curr) => accum + (curr.goldWeight || 0), 0);
  const aggregateWaitingTasks = filteredTasks.filter(t => t.status === 'Waiting Approval').length;
  const aggregateInProgressTasks = filteredTasks.filter(t => t.status === 'In Progress' || t.status === 'Rework').length;
  const aggregateCompletedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
  const aggregateLateCount = filteredTasks.filter(t => t.status === 'Completed' && (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0)).length;

  // Group task lists by Jewelry Types
  const categoriesList = ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant', 'Custom Jewelry'];
  const jewelryStatsObj = categoriesList.map(categoryName => {
    const matchTasks = filteredTasks.filter(t => t.jewelryType === categoryName || (categoryName === 'Custom Jewelry' && !['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant'].includes(t.jewelryType)));
    const grams = matchTasks.reduce((sum, curr) => sum + (curr.goldWeight || 0), 0);
    const completed = matchTasks.filter(t => t.status === 'Completed').length;
    const late = matchTasks.filter(t => t.status === 'Completed' && (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0)).length;
    let lateRate = 0;
    if (completed > 0) {
      lateRate = Math.round((late / completed) * 100);
    }

    return {
      categoryName,
      count: matchTasks.length,
      goldWeight: grams,
      completedCount: completed,
      lateCount: late,
      lateRate
    };
  });

  return (
    <div id="enterprise-reporting-engine" className="space-y-6">
      
      {/* Upper header action blocks: hidden entirely on Native print rendering layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
            ENTERPRISE MANUFACTURING & PERFORMANCE REPORTING
          </h2>
          <p className="text-xs text-gray-400">
            Generate printable dossiers containing late indicators, materials weight audits, and dynamic artisan success benchmarks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="p-2.5 px-5 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:brightness-110 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {isGeneratingPDF ? 'Generating...' : 'Download PDF Report (System Format)'}
          </button>
        </div>
      </div>

      {/* Global Filter Bar: hidden during browser printing */}
      <div className="p-5 bg-[#121214]/95 border border-gray-900 rounded-3xl space-y-4 shadow-xl text-left print:hidden">
        <span className="text-[10px] tracking-widest font-extrabold text-[#d4af37] uppercase flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Configure Analytics Pipeline Boundaries
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Pick Report Mode */}
          <div>
            <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Target Dimension</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl text-xs p-2.5 text-white focus:border-[#d4af37]"
            >
              <option value="all-employees">All Employees & Staff Yield</option>
              <option value="single-employee">Individual Specialists Performance Profile</option>
              <option value="jewelry">Jewelry Category & Material consumption</option>
            </select>
          </div>

          {/* Specific Search for Employee (removes long dropdowns) */}
          {reportType === 'single-employee' && (
            <div className="relative">
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Search Specialist ID or Name</label>
              <input
                type="text"
                placeholder="Type 'S' or employee ID..."
                value={employeeSearchQuery}
                onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl text-xs p-2.5 text-white focus:border-[#d4af37]"
              />
              {employeeSearchQuery.trim() && !employees.find(e => e.fullName.toLowerCase() === employeeSearchQuery.toLowerCase() || e.id.toLowerCase() === employeeSearchQuery.toLowerCase()) && (
                <div className="absolute top-full left-0 z-50 mt-2 w-full bg-[#0b152d] border border-[#1f3460] rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                  {employees
                    .filter(e => e.role === 'EMPLOYEE' && (e.fullName.toLowerCase().startsWith(employeeSearchQuery.toLowerCase()) || e.id.toLowerCase().startsWith(employeeSearchQuery.toLowerCase())))
                    .map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setEmployeeSearchQuery(emp.id);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1a2b53] border-b border-[#1f3460]/50 last:border-0 transition-colors list-none"
                      >
                        <span className="font-bold">{emp.fullName}</span> <span className="text-[#d4af37] font-mono text-xs ml-2">({emp.id})</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Select Specific Month (e.g. month-by-month filter) */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Calendar Month Filter</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl text-xs p-2 text-white font-mono focus:border-[#d4af37]"
            />
          </div>

        </div>

        {/* Quick select shortcuts buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/50 text-[10px]">
          <span className="text-gray-500 font-mono">Date Presets:</span>
          <button
            onClick={() => setQuickFilter('this-month')}
            className="px-2.5 py-1 bg-gray-950 hover:bg-gray-900 text-gray-300 rounded border border-gray-800 hover:border-[#d4af37]"
          >
            This Month
          </button>
          <button
            onClick={() => setQuickFilter('all-time')}
            className="px-2.5 py-1 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded border border-[#d4af37]/30"
          >
            Clear Filters (All Time)
          </button>

          {/* Current selected ranges display */}
          <div className="ml-auto text-gray-400 font-mono">
            {selectedMonth ? (
              <span>Active Target: <b>Month of {selectedMonth}</b></span>
            ) : (
              <span>Active Range: <b>All Time (Cumulative record folders)</b></span>
            )}
            <span className="ml-2 pl-2 border-l border-gray-800 text-[#d4af37]">
              Matches: <b>{filteredTasks.length} jobs</b>
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC SHEET REPORT PREVIEW CARD: Visually robust on dashboard and strictly print-adapted */}
      <div id="enterprise-printing-area" className="bg-[#121214] border border-gray-900 rounded-3xl p-6 md:p-10 text-left shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        
        {/* SHEET HEADER SPECIFICATIONS */}
        <div className="border-b-2 border-[#d4af37] pb-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6 print:border-black print:pb-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 px-2.5 bg-black border border-[#d4af37]/40 text-[#d4af37] text-[8px] tracking-widest font-extrabold uppercase rounded-lg print:border-black print:text-black print:bg-white">
                DIATRENDZ LUXURY ERP ANALYTICAL SHEET
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide print:text-black">
              {reportType === 'all-employees' && "MASTER WORKSHOP & ARTISAN PERFORMANCE REPORT"}
              {reportType === 'single-employee' && "SPECIALIST CRAFTSMAN PERFORMANCE DOSSIER"}
              {reportType === 'jewelry' && "JEWELRY CATEGORY PRODUCTION & DISPATCH REPORT"}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 mt-3.5 text-xs text-gray-400 font-mono print:text-black leading-relaxed">
              <div>
                <span>Date of Report:</span> <strong className="text-white print:text-black">{new Date().toLocaleDateString()}</strong>
              </div>
              <div>
                <span>Security Range Level:</span> <strong className="text-white print:text-black">Administrative (Confidential)</strong>
              </div>
              <div>
                <span>Temporal Boundary:</span> <strong className="text-[#d4af37] print:text-black">
                  {selectedMonth ? `Month: ${selectedMonth}` : 'Full cumulative history'}
                </strong>
              </div>
            </div>
          </div>

          {/* HIGH CONTRAST TOP-RIGHT SUCCESS STATUS (for single employee or general stats) */}
          <div className="text-right flex flex-col items-end shrink-0 min-w-[160px]">
            {reportType === 'single-employee' && activeEmployeeModel ? (
              <div className="bg-[#d4af37]/10 p-4 rounded-2xl border border-[#d4af37]/35 text-center w-full print:bg-white print:border-black">
                <span className="text-[9px] tracking-widest font-extrabold uppercase text-[#f3e5ab] block mb-1 print:text-black">
                  ON-TIME SUCCESS RATE
                </span>
                
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-mono font-extrabold text-[#d4af37] tracking-tight print:text-black">
                    {employeeSuccessRate}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">/ 100</span>
                </div>

                <div className="text-[10px] text-gray-400 mt-1.5 font-semibold">
                  {employeeSuccessRate >= 90 ? '✨ Highly Exemplary Yield' : employeeSuccessRate >= 75 ? '👍 Standard Yield' : '⚠ Delay Warn Trigger'}
                </div>
              </div>
            ) : (
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-center w-full print:bg-white print:border-black">
                <span className="text-[9px] tracking-widest font-extrabold uppercase text-gray-400 block mb-1 print:text-black">
                  CUMULATIVE LOADED YIELD
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-mono font-extrabold text-[#d4af37] tracking-tight print:text-black">
                    {filteredTasks.length}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">Jobs logged</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-1">
                  {aggregateCompletedTasks} Completed &bull; {aggregateLateCount} Late
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ======================================= */}
        {/* OPTION A: ALL EMPLOYEES REPORTING SCREEN */}
        {/* ======================================= */}
        {reportType === 'all-employees' && (
          <div className="space-y-8">
            
            {/* General Highlights Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl text-left print:border-black print:bg-white">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Active Gold Allocated</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block print:text-black">
                  {aggregateGramsGoldWeight(aggregateGramsOrFallback(aggregateGramsGolds))} g
                </span>
                <span className="text-[10px] text-gray-500 block">Total weight verified</span>
              </div>
              <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl text-left print:border-black print:bg-white">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Completed Products</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block print:text-black">
                  {aggregateCompletedTasks} Items
                </span>
                <span className="text-[10px] text-emerald-500 block">Yield efficiency finalized</span>
              </div>
              <div className="p-4 bg-gray-950 border border-gray-900 rounded-2xl text-left print:border-black print:bg-white">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Timelines Delay Count</span>
                <span className="text-lg font-bold text-red-400 font-mono mt-0.5 block print:text-black">
                  {aggregateLateCount} Tardiness
                </span>
                <span className="text-[10px] text-red-400 block">Exceeded approved limits</span>
              </div>
              <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl text-left print:border-black print:bg-white">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#d4af37] block">Dispatch Success Ratio</span>
                <span className="text-lg font-bold text-[#f3e5ab] font-mono mt-0.5 block print:text-black">
                  {Math.round(((aggregateCompletedTasks - aggregateLateCount) / (aggregateCompletedTasks || 1)) * 100)} %
                </span>
                <span className="text-[10px] text-gray-500 block">On-time quality clearance</span>
              </div>
            </div>

            {/* Comprehensive Roster Staff table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-2 print:text-black print:border-black">
                Specialist Craftsmen performance and delay metrics rankings
              </h3>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left text-gray-300 border-collapse print:text-black">
                  <thead>
                    <tr className="bg-gray-950/60 border-b border-gray-800 text-[10px] uppercase text-[#d4af37] font-bold font-mono tracking-wider print:border-black print:bg-white print:text-black">
                      <th className="py-3 px-4">Artisan Specialist</th>
                      <th className="py-3 px-4">Bench Dept</th>
                      <th className="py-3 px-4">Active Jobs</th>
                      <th className="py-3 px-4">Completed Jobs</th>
                      <th className="py-3 px-4">Exceeded Hours Count</th>
                      <th className="py-3 px-4">Productivity Index</th>
                      <th className="py-3 px-4 text-right">On-time accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 print:divide-black">
                    {employees
                      .filter(e => e.role === 'EMPLOYEE')
                      .map((emp) => {
                        const empTasks = filteredTasks.filter(t => t.assignedEmployeeId === emp.id);
                        const empActive = empTasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;
                        const empCompleted = empTasks.filter(t => t.status === 'Completed').length;
                        const empLate = empTasks.filter(t => t.status === 'Completed' && (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0)).length;
                        
                        let onTimeRate = 100;
                        if (empCompleted > 0) {
                          onTimeRate = Math.round(((empCompleted - empLate) / empCompleted) * 100);
                        } else {
                          onTimeRate = emp.productivityScore || 100;
                        }

                        return (
                          <tr 
                            key={emp.id} 
                            onClick={() => {
                              setEmployeeSearchQuery(emp.id);
                              setReportType('single-employee');
                              onSelectEmployee?.(emp);
                            }}
                            data-hover-employee-id={emp.id}
                            className="hover:bg-white/[0.04] cursor-pointer transition print:hover:bg-transparent"
                          >
                            <td className="py-3 px-4 font-bold text-white print:text-black flex items-center gap-2">
                              <span>{emp.fullName}</span>
                              <span className="text-[9px] text-gray-500 font-mono font-normal">({emp.id})</span>
                            </td>
                            <td className="py-3 px-4 text-gray-400 print:text-black">{emp.department || 'Assembly'}</td>
                            <td className="py-3 px-4 font-mono font-bold">{empActive}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 print:text-black">{empCompleted}</td>
                            <td className="py-3 px-4 font-mono text-red-400 print:text-black">
                              {empLate > 0 ? `${empLate} delay` : '0 - Fine'}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-gray-400 print:text-black">
                              {emp.productivityScore || 90}%
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                onTimeRate >= 90 ? 'text-emerald-400 bg-emerald-950/20' : 
                                onTimeRate >= 70 ? 'text-amber-400 bg-amber-950/20' : 
                                'text-red-400 bg-red-950/20'
                              } print:bg-white print:text-black print:p-0`}>
                                {onTimeRate}% Success
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note remarks footer block */}
            <div className="pt-4 border-t border-gray-900 pb-12 flex justify-between text-[10px] text-gray-500 font-mono print:border-black print:text-black">
              <span>Authority Approver Signature: _______________________</span>
              <span>Diatrendz Manufacturing ERP Verified Record Log</span>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* OPTION B: INDIVIDUAL SPECIALIST REPORT */}
        {/* ======================================= */}
        {reportType === 'single-employee' && (
          !activeEmployeeModel ? (
            <div className="py-12 text-center text-gray-400">
              Please search for an Employee ID (e.g. EMP-001) or Name to generate their report.
            </div>
          ) : (
          <div className="space-y-8">
            
            {/* Employee metadata section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-950 border border-gray-900 rounded-2xl text-left print:border-none print:bg-white print:text-black print:p-0">
              
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Artisan Name & Credential</span>
                <span className="text-base font-bold text-white block mt-0.5 print:text-black">
                  {activeEmployeeModel.fullName}
                </span>
                <span className="text-xs text-[#d4af37] font-mono block mt-1">
                  Secure ID: {activeEmployeeModel.id}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">
                  Department Bench: <b>{activeEmployeeModel.department || 'General Bench'}</b>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Secure Workspace profile</span>
                <span className="text-xs text-gray-300 block mt-1 print:text-black">
                  Email: <b>{activeEmployeeModel.email}</b>
                </span>
                <span className="text-xs text-gray-300 block mt-0.5 print:text-black">
                  Joining date: <b>{activeEmployeeModel.joiningDate || 'January 20, 2026'}</b>
                </span>
                <span className="text-[10px] block text-[#f3e5ab] mt-1 uppercase font-bold">
                  Class: {activeEmployeeModel.skillLevel || 'Senior Specialist'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Periodical Handled Metrics</span>
                <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-left text-xs">
                  <div>
                    <span>Total Jobs: </span>
                    <strong className="text-white print:text-black">{employeeTasks.length}</strong>
                  </div>
                  <div>
                    <span>Completed: </span>
                    <strong className="text-emerald-400 print:text-black">{completedEmployeeTasks.length}</strong>
                  </div>
                  <div>
                    <span>Hours Logged: </span>
                    <strong className="text-[#d4af37] print:text-black">
                      {completedEmployeeTasks.reduce((sum, curr) => sum + (curr.actualTime || 0), 0)} hr
                    </strong>
                  </div>
                  <div>
                    <span>Overapproved: </span>
                    <strong className="text-red-400 print:text-black">{lateEmployeeTasksCount}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Micro warning indicator if delay is high */}
            {lateEmployeeTasksCount > 1 && (
              <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl flex items-center gap-3.5 text-xs text-orange-400 text-left print:hidden">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <b className="font-bold">System Warning clearance: </b>
                  This specialist craftsman has registered multiple delayed tasks ({lateEmployeeTasksCount}) where the custom workbench carving or gold setting time exceeded initial approved estimate hours. Recommend setting hours audit guidelines.
                </div>
              </div>
            )}

            {/* List of Handled Tasks Dossier */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-2 print:text-black print:border-black">
                Dossier of all manufacturing tasks handled by this specialist
              </h3>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left text-gray-300 border-collapse print:text-black">
                  <thead>
                    <tr className="bg-gray-950 border-b border-gray-800 text-[10px] uppercase text-[#d4af37] font-bold font-mono tracking-wider print:border-black print:bg-white print:text-black">
                      <th className="py-2.5 px-3">Job ID</th>
                      <th className="py-2.5 px-3">Jewelry Type</th>
                      <th className="py-2.5 px-3">Gold alloy / Weight</th>
                      <th className="py-2.5 px-3 font-mono">Est Hr</th>
                      <th className="py-2.5 px-3 font-mono">Approved Hr</th>
                      <th className="py-2.5 px-3 font-mono">Actual Hr</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Verification compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 print:divide-black">
                    {employeeTasks.map((t) => {
                      const isLate = t.status === 'Completed' && (t.actualTime || 0) > (t.approvedTime || t.estimatedTime || 0);
                      return (
                        <tr key={t.id} className="hover:bg-white/[0.01] transition print:hover:bg-transparent">
                          <td className="py-3 px-3 font-mono font-bold text-white print:text-black">{t.id}</td>
                          <td className="py-3 px-3 font-medium text-gray-200 print:text-black">{t.jewelryType} &mdash; <i className="text-gray-400 font-normal">{t.customerName}</i></td>
                          <td className="py-3 px-3 text-gray-400 print:text-black">{t.materialType} • <span className="text-[#f3e5ab] font-bold font-mono">{t.goldWeight} g</span></td>
                          <td className="py-3 px-3 font-mono">{t.estimatedTime} h</td>
                          <td className="py-3 px-3 font-mono text-emerald-400 print:text-black">{t.approvedTime || t.estimatedTime} h</td>
                          <td className="py-3 px-3 font-mono font-bold text-white print:text-black">{t.actualTime || 0} h</td>
                          <td className="py-3 px-3 text-gray-400 font-mono print:text-black">{t.dueDate}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold">
                            {t.status === 'Completed' ? (
                              isLate ? (
                                <span className="bg-red-950/40 text-red-400 p-1 px-2.5 rounded border border-red-900/40 text-[9px] print:text-black print:border-black print:bg-white">
                                  ⚠ EXCEEDED LIMIT
                                </span>
                              ) : (
                                <span className="bg-emerald-950/40 text-emerald-400 p-1 px-2.5 rounded border border-emerald-950/40 text-[9px] print:text-black print:border-black print:bg-white">
                                  ✓ ON-TIME SUCCESS
                                </span>
                              )
                            ) : (
                              <span className="bg-blue-950/40 text-blue-400 p-1 px-2.5 rounded border border-blue-900/40 text-[9px] print:text-black print:border-black print:bg-white uppercase">
                                IN-FLIGHT ({t.status})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {employeeTasks.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                          No tasks recorded for this artisan in specified period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary remarks notes */}
            <div className="pt-6 border-t border-gray-900 pb-12 grid grid-cols-2 text-[10px] text-gray-500 font-mono print:border-black print:text-black">
              <div className="text-left">
                <span>Specialist Signature Acceptance:</span>
                <br />
                <br />
                <span className="font-bold text-gray-400 print:text-black">{activeEmployeeModel.fullName}</span>
              </div>
              <div className="text-right">
                <span>ERP Audit Verification: Approved</span>
                <br />
                <br />
                <span>Verified by secure key hash system</span>
              </div>
            </div>

          </div>
          )
        )}

        {/* ======================================= */}
        {/* OPTION C: JEWELRY PRODUCTION REPORT      */}
        {/* ======================================= */}
        {reportType === 'jewelry' && (
          <div className="space-y-8">
            
            {/* General Highlights Gold allocations */}
            <div className="p-6 bg-gray-950 border border-gray-900 rounded-3xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-black print:p-0 print:bg-white">
              <div>
                <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-extrabold block">
                  Material alloy and design type categorization
                </span>
                <h3 className="text-sm font-semibold text-white mt-1 print:text-black">
                  Cumulative gold alloy materials trackings:
                </h3>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 font-mono text-left print:border-none print:p-0 print:bg-white">
                <div className="text-xs text-gray-400 print:text-black">TOTAL WEIGHT FINALIZED:</div>
                <div className="text-2xl font-black text-[#d4af37] print:text-black">
                  {aggregateGramsGoldWeight(aggregateGramsOrFallback(aggregateGramsGolds))} grams
                </div>
              </div>
            </div>

            {/* List by Jewelry Category table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-2 print:text-black print:border-black">
                Yield metrics per jewelry design family
              </h3>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-xs text-left text-gray-300 border-collapse print:text-black">
                  <thead>
                    <tr className="bg-gray-950 border-b border-gray-800 text-[10px] uppercase text-[#d4af37] font-bold font-mono tracking-wider print:border-black print:bg-white print:text-black">
                      <th className="py-3 px-4">Jewelry Design Group</th>
                      <th className="py-3 px-4">Total Items Invoiced</th>
                      <th className="py-3 px-4">Allocated Metal Weight</th>
                      <th className="py-3 px-4">Completed Items</th>
                      <th className="py-3 px-4">Late items</th>
                      <th className="py-3 px-4 text-right">Lateness Rate (Overapproved)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 print:divide-black">
                    {jewelryStatsObj.map((group) => (
                      <tr key={group.categoryName} className="hover:bg-white/[0.01] transition print:hover:bg-transparent">
                        <td className="py-3 px-4 font-bold text-white print:text-black flex items-center gap-2">
                          <Gem className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                          <span>{group.categoryName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{group.count} jobs</td>
                        <td className="py-3 px-4 font-mono text-gray-400 print:text-black">
                          {group.goldWeight} grams
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400 print:text-black">{group.completedCount} finalized</td>
                        <td className="py-3 px-4 font-mono text-red-400 print:text-black">
                          {group.lateCount} delayed
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            group.lateRate > 20 ? 'text-red-400 bg-red-950/20' : 'text-emerald-400 bg-emerald-950/20'
                          } print:bg-white print:text-black print:p-0`}>
                            {group.lateRate}% late index
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fine granular dispatch items listings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f3e5ab] border-b border-gray-900 pb-2 print:text-black print:border-black">
                Granular dispatch and invoice logs matching active filters
              </h3>

              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-[11px] text-left text-gray-400 border-collapse print:text-black">
                  <thead>
                    <tr className="border-b border-gray-800 text-[9px] uppercase text-gray-500 font-bold font-mono tracking-wider print:border-black print:text-black">
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Client</th>
                      <th className="py-2 px-3">Assigned Smith</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Gold Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 print:divide-black">
                    {filteredTasks.slice(0, 15).map(t => (
                      <tr key={t.id}>
                        <td className="py-2 px-3 font-mono text-white print:text-black">{t.id}</td>
                        <td className="py-2 px-3 text-gray-300 print:text-black">{t.jewelryType}</td>
                        <td className="py-2 px-3 italic">{t.customerName}</td>
                        <td className="py-2 px-3 text-[#f3e5ab]/80 print:text-black font-semibold">{t.assignedEmployeeName}</td>
                        <td className="py-2 px-3 font-bold uppercase">{t.status}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#d4af37] print:text-black">{t.goldWeight} g</td>
                      </tr>
                    ))}

                    {filteredTasks.length > 15 && (
                      <tr>
                        <td colSpan={6} className="py-2 px-3 text-center text-gray-500 font-mono">
                          And {filteredTasks.length - 15} other active manufacturing cards logged under active query filter...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report footer section */}
            <div className="pt-4 border-t border-gray-900 pb-12 flex justify-between text-[10px] text-gray-500 font-mono print:border-black print:text-black">
              <span>Verified Dispatch Officer Marks: _______________________</span>
              <span>Invoiced Gold Material Yield Trackers</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

// Handlers for data stability fallback and rendering type adjustments
function aggregateGramsOrFallback(val: number): number {
  return isNaN(val) ? 0 : val;
}

function aggregateGramsGoldWeight(weight: number): string {
  return weight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

function getStatusColorClass(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-[#0f241a] text-[#4ade80] border-[#1b4332]';
    case 'In Progress':
      return 'bg-blue-950/40 text-blue-400 border-blue-900/40';
    case 'Rework':
      return 'bg-red-950/40 text-red-400 border-red-900/45';
    case 'Waiting Approval':
      return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
    case 'Assigned':
      return 'bg-zinc-800 text-gray-300 border-gray-700';
    default:
      return 'bg-gray-900 text-gray-400 border-gray-800';
  }
}

function getRoleBadgeColor(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-red-950/55 text-red-500 border-red-900/40';
    case 'ADMIN':
      return 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30';
    case 'QC':
      return 'bg-teal-950/40 text-teal-400 border-teal-900/40';
    default:
      return 'bg-gray-900 text-gray-400 border-gray-800';
  }
}
