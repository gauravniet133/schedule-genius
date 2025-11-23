import { Department, Teacher, Subject, Room, Section, TimetableEntry, TimeSlot, GeneratedTimetable, TimetableConstraint } from '@/types/timetable';
import { BreakTime, SchedulingPreferences } from '@/types/constraints';

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

export class EnhancedTimetableGenerator {
  private teachers: Teacher[];
  private subjects: Subject[];
  private rooms: Room[];
  private sections: Section[];
  private breaks: BreakTime[];
  private preferences: SchedulingPreferences;
  private entries: TimetableEntry[] = [];
  private constraints: TimetableConstraint[] = [];

  constructor(
    teachers: Teacher[],
    subjects: Subject[],
    rooms: Room[],
    sections: Section[],
    breaks: BreakTime[],
    preferences: SchedulingPreferences
  ) {
    this.teachers = teachers;
    this.subjects = subjects;
    this.rooms = rooms;
    this.sections = sections;
    this.breaks = breaks;
    this.preferences = preferences;
  }

  generate(): GeneratedTimetable {
    this.entries = [];
    this.constraints = [];

    // Filter time slots based on preferences
    const availableSlots = this.getAvailableTimeSlots();

    // Process each section
    for (const section of this.sections) {
      this.scheduleSectionClasses(section, availableSlots);
    }

    // Check all constraints
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

  private getAvailableTimeSlots(): TimeSlot[] {
    return TIME_SLOTS.filter(slot => {
      // Check if slot is within preferred hours
      if (slot.startTime < this.preferences.preferredStartTime || 
          slot.startTime >= this.preferences.preferredEndTime) {
        return false;
      }

      // Check if slot conflicts with lunch break
      if (this.preferences.lunchBreakRequired) {
        if (slot.startTime >= this.preferences.lunchBreakStart && 
            slot.startTime < this.preferences.lunchBreakEnd) {
          return false;
        }
      }

      // Check if slot conflicts with any break
      const hasBreakConflict = this.breaks.some(
        breakTime => breakTime.day === slot.day &&
        slot.startTime >= breakTime.startTime &&
        slot.startTime < breakTime.endTime
      );

      return !hasBreakConflict;
    });
  }

  private scheduleSectionClasses(section: Section, availableSlots: TimeSlot[]) {
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
      let lastScheduledDay: string | null = null;
      let lastScheduledSubjectId: string | null = null;

      for (const timeSlot of availableSlots) {
        if (scheduledHours >= hoursToSchedule) break;

        // Check teacher availability
        if (!this.isTeacherAvailable(teacher, timeSlot)) continue;

        // Check for teacher conflicts
        if (this.hasTeacherConflict(teacher.id, timeSlot)) continue;

        // Check for section conflicts
        if (this.hasSectionConflict(section.id, timeSlot)) continue;

        // Check consecutive hours constraint
        if (!this.checkConsecutiveHours(section.id, timeSlot)) continue;

        // Check back-to-back same subject constraint
        if (this.preferences.avoidBackToBackSameSubject) {
          if (lastScheduledDay === timeSlot.day && lastScheduledSubjectId === subject.id) {
            const lastSlotTime = this.getLastScheduledTime(section.id, timeSlot.day);
            if (lastSlotTime && this.isConsecutiveSlot(lastSlotTime, timeSlot.startTime)) {
              continue;
            }
          }
        }

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
        lastScheduledDay = timeSlot.day;
        lastScheduledSubjectId = subject.id;
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

  private checkConsecutiveHours(sectionId: string, timeSlot: TimeSlot): boolean {
    const sectionEntries = this.entries.filter(e => 
      e.sectionId === sectionId && e.timeSlot.day === timeSlot.day
    );

    if (sectionEntries.length === 0) return true;

    // Count consecutive hours before this slot
    let consecutiveCount = 0;
    const sortedEntries = sectionEntries.sort((a, b) => 
      a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)
    );

    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const entry = sortedEntries[i];
      if (this.isConsecutiveSlot(entry.timeSlot.startTime, timeSlot.startTime)) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    return consecutiveCount < this.preferences.maxConsecutiveHours;
  }

  private isConsecutiveSlot(time1: string, time2: string): boolean {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return Math.abs(mins2 - mins1) === 60;
  }

  private getLastScheduledTime(sectionId: string, day: string): string | null {
    const dayEntries = this.entries
      .filter(e => e.sectionId === sectionId && e.timeSlot.day === day)
      .sort((a, b) => b.timeSlot.startTime.localeCompare(a.timeSlot.startTime));

    return dayEntries[0]?.timeSlot.startTime || null;
  }

  private findAvailableRoom(subject: Subject, timeSlot: TimeSlot, studentCount: number): Room | undefined {
    return this.rooms.find(room => {
      // Check room type for labs
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
    // Check for double bookings
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

    // Check teacher workload
    this.checkTeacherWorkload();

    // Check availability violations
    this.checkAvailabilityViolations();
  }

  private checkTeacherDoubleBooking(): boolean {
    const teacherSlots = new Map<string, Set<string>>();

    for (const entry of this.entries) {
      const key = `${entry.timeSlot.day}-${entry.timeSlot.startTime}`;
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

  private checkTeacherWorkload() {
    const teacherHours = new Map<string, number>();

    for (const entry of this.entries) {
      teacherHours.set(entry.teacherId, (teacherHours.get(entry.teacherId) || 0) + 1);
    }

    for (const teacher of this.teachers) {
      const hours = teacherHours.get(teacher.id) || 0;
      if (hours > teacher.maxHoursPerWeek) {
        this.constraints.push({
          type: 'soft',
          description: `${teacher.name} exceeds maximum hours: ${hours}/${teacher.maxHoursPerWeek}`,
          violated: true,
        });
      }
    }
  }

  private checkAvailabilityViolations() {
    for (const entry of this.entries) {
      const teacher = this.teachers.find(t => t.id === entry.teacherId);
      if (teacher && !this.isTeacherAvailable(teacher, entry.timeSlot)) {
        this.constraints.push({
          type: 'soft',
          description: `${teacher.name} scheduled outside availability on ${entry.timeSlot.day} at ${entry.timeSlot.startTime}`,
          violated: true,
        });
      }
    }
  }
}
