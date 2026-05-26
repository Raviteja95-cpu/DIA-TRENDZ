import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { JobCard } from '../../models/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-work-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-reports.component.html',
  styles: []
})
export class WorkReportsComponent implements OnInit {
  isLoading: boolean = false;
  selectedMonth: string = '';
  selectedSpecialist: string = '';
  selectedJobId: string = '';
  
  // Data cache
  historyJobs: JobCard[] = [];
  monthsList: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getTasks().subscribe({
      next: (tasks) => this.historyJobs = tasks
    });
  }

  handleSearchSpecialist(event: any) {
    const term = event.target.value;
    if (term) {
      this.apiService.searchHistory({ query: term }).subscribe({
        next: (res) => this.historyJobs = res
      });
    } else {
      this.apiService.getTasks().subscribe({
        next: (tasks) => this.historyJobs = tasks
      });
    }
  }

  async handleDownloadPDF() {
    this.isLoading = true;
    const element = document.getElementById('dispatch-report-print');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgWidth = 210; // A4 standard width (mm)
      const pageHeight = 295; // A4 standard height (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`diatrendz-dispatch-report-${Date.now()}.pdf`);
      this.isLoading = false;
    } catch (err) {
      console.error('Pdf download failed', err);
      this.isLoading = false;
    }
  }
}
