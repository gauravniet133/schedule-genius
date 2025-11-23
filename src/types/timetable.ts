export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  availability: TimeSlot[];
  maxHoursPerWeek: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  hoursPerWeek: number;
  requiresLab: boolean;
  assignedTeacherId?: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'auditorium';
  capacity: number;
  departmentId?: string;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
  semester: number;
  studentCount: number;
  subjects: string[]; // subject IDs
}

export interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // HH:mm format
  endTime: string;
}

export interface TimetableEntry {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  timeSlot: TimeSlot;
}

export interface TimetableConstraint {
  type: 'hard' | 'soft';
  description: string;
  violated: boolean;
}

export interface GeneratedTimetable {
  id: string;
  name: string;
  departmentId: string;
  entries: TimetableEntry[];
  constraints: TimetableConstraint[];
  generatedAt: Date;
  conflicts: number;
}
