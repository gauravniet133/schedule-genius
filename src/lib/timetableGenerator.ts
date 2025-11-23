import { Department, Teacher, Subject, Room, Section, TimetableEntry, TimeSlot, GeneratedTimetable, TimetableConstraint } from '@/types/timetable';

const TIME_SLOTS: TimeSlot[] = [
  { day: 'Monday', startTime: '09:00', endTime: '10:00' },
  { day: 'Monday', startTime: '10:00', endTime: '11:00' },
  { day: 'Monday', startTime: '11:00', endTime: '12:00' },
  { day: 'Monday', startTime: '12:00', endTime: '13:00' },
  { day: 'Monday', startTime: '14:00', endTime: '15:00' },
  { day: 'Monday', startTime: '15:00', endTime: '16:00' },
  { day: 'Monday', startTime: '16:00', endTime: '17:00' },
  { day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
  { day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
  { day: 'Tuesday', startTime: '11:00', endTime: '12:00' },
  { day: 'Tuesday', startTime: '12:00', endTime: '13:00' },
  { day: 'Tuesday', startTime: '14:00', endTime: '15:00' },
  { day: 'Tuesday', startTime: '15:00', endTime: '16:00' },
  { day: 'Tuesday', startTime: '16:00', endTime: '17:00' },
  { day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
  { day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
  { day: 'Wednesday', startTime: '11:00', endTime: '12:00' },
  { day: 'Wednesday', startTime: '12:00', endTime: '13:00' },
  { day: 'Wednesday', startTime: '14:00', endTime: '15:00' },
  { day: 'Wednesday', startTime: '15:00', endTime: '16:00' },
  { day: 'Wednesday', startTime: '16:00', endTime: '17:00' },
  { day: 'Thursday', startTime: '09:00', endTime: '10:00' },
  { day: 'Thursday', startTime: '10:00', endTime: '11:00' },
  { day: 'Thursday', startTime: '11:00', endTime: '12:00' },
  { day: 'Thursday', startTime: '12:00', endTime: '13:00' },
  { day: 'Thursday', startTime: '14:00', endTime: '15:00' },
  { day: 'Thursday', startTime: '15:00', endTime: '16:00' },
  { day: 'Thursday', startTime: '16:00', endTime: '17:00' },
  { day: 'Friday', startTime: '09:00', endTime: '10:00' },
  { day: 'Friday', startTime: '10:00', endTime: '11:00' },
  { day: 'Friday', startTime: '11:00', endTime: '12:00' },
  { day: 'Friday', startTime: '12:00', endTime: '13:00' },
  { day: 'Friday', startTime: '14:00', endTime: '15:00' },
  { day: 'Friday', startTime: '15:00', endTime: '16:00' },
  { day: 'Friday', startTime: '16:00', endTime: '17:00' },
];

export class TimetableGenerator {
  private teachers: Teacher[];
  private subjects: Subject[];
  private rooms: Room[];
  private sections: Section[];
  private entries: TimetableEntry[] = [];
  private constraints: TimetableConstraint[] = [];

  constructor(
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    sections: Section[]
  ) {
    this.teachers = teachers;
    this.subjects = subjects;
    this.rooms = rooms;
    this.sections = sections;
  }

  generate(): GeneratedTimetable {
    this.entries = [];
    this.constraints = [];

    // Process each section
    for (const section of this.sections) {
      this.scheduleSectionClasses(section);
    }

    // Check constraints
    this.validateConstraints();

    return {
      id: crypto.randomUUID(),
      name: `Timetable ${new Date().toLocaleDateString()}`,
      departmentId: this.sections[0]?.departmentId || '',
      entries: this.entries,
      constraints: this.constraints,
      generatedAt: new Date(),
      conflicts: this.constraints.filter(c => c.type === 'hard' && c.violated).length,
    };
  }

  private scheduleSectionClasses(section: Section) {
    const sectionSubjects = this.subjects.filter(s => section.subjects.includes(s.id));

    for (const subject of sectionSubjects) {
      const teacher = this.teachers.find(t => t.id === subject.assignedTeacherId);
      if (!teacher) {
        this.constraints.push({
          type: 'hard',
          description: `No teacher assigned to ${subject.name} for ${section.name}`,
          violated: true,
        });
        continue;
      }

      const hoursToSchedule = subject.hoursPerWeek;
      let scheduledHours = 0;

      for (const timeSlot of TIME_SLOTS) {
        if (scheduledHours >= hoursToSchedule) break;

        // Check if teacher is available
        if (!this.isTeacherAvailable(teacher, timeSlot)) continue;

        // Check if teacher already has a class
        if (this.hasTeacherConflict(teacher.id, timeSlot)) continue;

        // Check if section already has a class
        if (this.hasSectionConflict(section.id, timeSlot)) continue;

        // Find available room
        const room = this.findAvailableRoom(subject, timeSlot, section.studentCount);
        if (!room) continue;

        // Schedule the class
        this.entries.push({
          id: crypto.randomUUID(),
          sectionId: section.id,
          subjectId: subject.id,
          teacherId: teacher.id,
          roomId: room.id,
          timeSlot,
        });

        scheduledHours++;
      }

      if (scheduledHours < hoursToSchedule) {
        this.constraints.push({
          type: 'soft',
          description: `Only scheduled ${scheduledHours}/${hoursToSchedule} hours for ${subject.name} in ${section.name}`,
          violated: true,
        });
      }
    }
  }

  private isTeacherAvailable(teacher: Teacher, timeSlot: TimeSlot): boolean {
    if (teacher.availability.length === 0) return true;
    return teacher.availability.some(
      slot => slot.day === timeSlot.day && 
      slot.startTime <= timeSlot.startTime && 
      slot.endTime >= timeSlot.endTime
    );
  }

  private hasTeacherConflict(teacherId: string, timeSlot: TimeSlot): boolean {
    return this.entries.some(
      entry => entry.teacherId === teacherId &&
      entry.timeSlot.day === timeSlot.day &&
      entry.timeSlot.startTime === timeSlot.startTime
    );
  }

  private hasSectionConflict(sectionId: string, timeSlot: TimeSlot): boolean {
    return this.entries.some(
      entry => entry.sectionId === sectionId &&
      entry.timeSlot.day === timeSlot.day &&
      entry.timeSlot.startTime === timeSlot.startTime
    );
  }

  private findAvailableRoom(subject: Subject, timeSlot: TimeSlot, studentCount: number): Room | undefined {
    const requiredType = subject.requiresLab ? 'lab' : 'classroom';
    
    return this.rooms.find(room => {
      // Check room type
      if (subject.requiresLab && room.type !== 'lab') return false;
      
      // Check capacity
      if (room.capacity < studentCount) return false;

      // Check if room is already occupied
      const hasConflict = this.entries.some(
        entry => entry.roomId === room.id &&
        entry.timeSlot.day === timeSlot.day &&
        entry.timeSlot.startTime === timeSlot.startTime
      );

      return !hasConflict;
    });
  }

  private validateConstraints() {
    // Add constraint checks
    this.constraints.push({
      type: 'hard',
      description: 'No teacher double-booking',
      violated: this.checkTeacherDoubleBooking(),
    });

    this.constraints.push({
      type: 'hard',
      description: 'No room double-booking',
      violated: this.checkRoomDoubleBooking(),
    });

    this.constraints.push({
      type: 'hard',
      description: 'No section double-booking',
      violated: this.checkSectionDoubleBooking(),
    });
  }

  private checkTeacherDoubleBooking(): boolean {
    const teacherSlots = new Map<string, Set<string>>();

    for (const entry of this.entries) {
      const key = `${entry.teacherId}-${entry.timeSlot.day}-${entry.timeSlot.startTime}`;
      const slots = teacherSlots.get(entry.teacherId) || new Set();
      
      if (slots.has(key)) return true;
      
      slots.add(key);
      teacherSlots.set(entry.teacherId, slots);
    }

    return false;
  }

  private checkRoomDoubleBooking(): boolean {
    const roomSlots = new Map<string, Set<string>>();

    for (const entry of this.entries) {
      const key = `${entry.timeSlot.day}-${entry.timeSlot.startTime}`;
      const slots = roomSlots.get(entry.roomId) || new Set();
      
      if (slots.has(key)) return true;
      
      slots.add(key);
      roomSlots.set(entry.roomId, slots);
    }

    return false;
  }

  private checkSectionDoubleBooking(): boolean {
    const sectionSlots = new Map<string, Set<string>>();

    for (const entry of this.entries) {
      const key = `${entry.timeSlot.day}-${entry.timeSlot.startTime}`;
      const slots = sectionSlots.get(entry.sectionId) || new Set();
      
      if (slots.has(key)) return true;
      
      slots.add(key);
      sectionSlots.set(entry.sectionId, slots);
    }

    return false;
  }
}
