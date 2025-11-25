import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GeneratedTimetable, TimetableEntry } from '@/types/timetable';
import { storage } from './storage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export interface PDFExportOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  departmentName?: string;
  layout?: 'section' | 'teacher' | 'room';
}

export class TimetablePDFExporter {
  private doc: jsPDF;
  private timetable: GeneratedTimetable;
  private options: Required<PDFExportOptions>;

  constructor(timetable: GeneratedTimetable, options: PDFExportOptions = {}) {
    this.doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    this.timetable = timetable;
    this.options = {
      includeHeader: options.includeHeader ?? true,
      includeFooter: options.includeFooter ?? true,
      departmentName: options.departmentName ?? 'Department',
      layout: options.layout ?? 'section'
    };
  }

  private addHeader(title: string) {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    
    // Add gradient background (simulated with rectangle)
    this.doc.setFillColor(59, 130, 246); // primary color
    this.doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Add title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.options.departmentName, 15, 15);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(title, 15, 24);
    
    // Add generation info
    this.doc.setFontSize(9);
    const dateStr = `Generated: ${new Date(this.timetable.generatedAt).toLocaleString()}`;
    this.doc.text(dateStr, pageWidth - 15, 15, { align: 'right' });
    
    const conflictStr = this.timetable.conflicts === 0 
      ? '✓ No Conflicts' 
      : `⚠ ${this.timetable.conflicts} Conflicts`;
    this.doc.text(conflictStr, pageWidth - 15, 22, { align: 'right' });
    
    this.doc.setTextColor(0, 0, 0);
  }

  private addFooter(pageNum: number) {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text(
      `Page ${pageNum} | ${this.timetable.name}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  private getSectionSchedule(sectionId: string): any[][] {
    const entries = this.timetable.entries.filter(e => e.sectionId === sectionId);
    const schedule: any[][] = [];

    for (const timeSlot of TIME_SLOTS) {
      const row = [timeSlot];
      for (const day of DAYS) {
        const entry = entries.find(
          e => e.timeSlot.day === day && e.timeSlot.startTime === timeSlot
        );
        
        if (entry) {
          const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
          const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);
          const room = storage.getRooms().find(r => r.id === entry.roomId);
          
          row.push(`${subject?.code || ''}\n${teacher?.name || ''}\n${room?.name || ''}`);
        } else {
          row.push('');
        }
      }
      schedule.push(row);
    }

    return schedule;
  }

  private getTeacherSchedule(teacherId: string): any[][] {
    const entries = this.timetable.entries.filter(e => e.teacherId === teacherId);
    const schedule: any[][] = [];

    for (const timeSlot of TIME_SLOTS) {
      const row = [timeSlot];
      for (const day of DAYS) {
        const entry = entries.find(
          e => e.timeSlot.day === day && e.timeSlot.startTime === timeSlot
        );
        
        if (entry) {
          const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
          const section = storage.getSections().find(s => s.id === entry.sectionId);
          const room = storage.getRooms().find(r => r.id === entry.roomId);
          
          row.push(`${subject?.code || ''}\n${section?.name || ''}\n${room?.name || ''}`);
        } else {
          row.push('');
        }
      }
      schedule.push(row);
    }

    return schedule;
  }

  private getRoomSchedule(roomId: string): any[][] {
    const entries = this.timetable.entries.filter(e => e.roomId === roomId);
    const schedule: any[][] = [];

    for (const timeSlot of TIME_SLOTS) {
      const row = [timeSlot];
      for (const day of DAYS) {
        const entry = entries.find(
          e => e.timeSlot.day === day && e.timeSlot.startTime === timeSlot
        );
        
        if (entry) {
          const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
          const section = storage.getSections().find(s => s.id === entry.sectionId);
          const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);
          
          row.push(`${subject?.code || ''}\n${section?.name || ''}\n${teacher?.name || ''}`);
        } else {
          row.push('');
        }
      }
      schedule.push(row);
    }

    return schedule;
  }

  exportSections() {
    let pageNum = 1;
    const sections = storage.getSections();

    sections.forEach((section, index) => {
      const sectionEntries = this.timetable.entries.filter(e => e.sectionId === section.id);
      if (sectionEntries.length === 0) return;

      if (index > 0) {
        this.doc.addPage();
        pageNum++;
      }

      if (this.options.includeHeader) {
        this.addHeader(`Section: ${section.name}`);
      }

      const schedule = this.getSectionSchedule(section.id);

      autoTable(this.doc, {
        startY: this.options.includeHeader ? 40 : 15,
        head: [['Time', ...DAYS]],
        body: schedule,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fillColor: [243, 244, 246], fontStyle: 'bold', halign: 'left' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      if (this.options.includeFooter) {
        this.addFooter(pageNum);
      }
    });
  }

  exportTeachers() {
    let pageNum = 1;
    const teachers = storage.getTeachers();

    teachers.forEach((teacher, index) => {
      const teacherEntries = this.timetable.entries.filter(e => e.teacherId === teacher.id);
      if (teacherEntries.length === 0) return;

      if (index > 0) {
        this.doc.addPage();
        pageNum++;
      }

      if (this.options.includeHeader) {
        this.addHeader(`Teacher: ${teacher.name}`);
      }

      const schedule = this.getTeacherSchedule(teacher.id);

      autoTable(this.doc, {
        startY: this.options.includeHeader ? 40 : 15,
        head: [['Time', ...DAYS]],
        body: schedule,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fillColor: [243, 244, 246], fontStyle: 'bold', halign: 'left' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      if (this.options.includeFooter) {
        this.addFooter(pageNum);
      }
    });
  }

  exportRooms() {
    let pageNum = 1;
    const rooms = storage.getRooms();

    rooms.forEach((room, index) => {
      const roomEntries = this.timetable.entries.filter(e => e.roomId === room.id);
      if (roomEntries.length === 0) return;

      if (index > 0) {
        this.doc.addPage();
        pageNum++;
      }

      if (this.options.includeHeader) {
        this.addHeader(`Room: ${room.name} (${room.type})`);
      }

      const schedule = this.getRoomSchedule(room.id);

      autoTable(this.doc, {
        startY: this.options.includeHeader ? 40 : 15,
        head: [['Time', ...DAYS]],
        body: schedule,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fillColor: [243, 244, 246], fontStyle: 'bold', halign: 'left' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      if (this.options.includeFooter) {
        this.addFooter(pageNum);
      }
    });
  }

  save(filename?: string) {
    const fname = filename || `${this.timetable.name.replace(/\s+/g, '_')}.pdf`;
    this.doc.save(fname);
  }

  export() {
    switch (this.options.layout) {
      case 'teacher':
        this.exportTeachers();
        break;
      case 'room':
        this.exportRooms();
        break;
      default:
        this.exportSections();
    }
    this.save();
  }
}
