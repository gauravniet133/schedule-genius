import { Department, Teacher, Subject, Room, Section, GeneratedTimetable } from '@/types/timetable';
import { BreakTime, SchedulingPreferences } from '@/types/constraints';

const STORAGE_KEYS = {
  DEPARTMENTS: 'timetable_departments',
  TEACHERS: 'timetable_teachers',
  SUBJECTS: 'timetable_subjects',
  ROOMS: 'timetable_rooms',
  SECTIONS: 'timetable_sections',
  TIMETABLES: 'timetable_generated',
  BREAKS: 'timetable_breaks',
  PREFERENCES: 'timetable_preferences',
};

// Default preferences
const DEFAULT_PREFERENCES: SchedulingPreferences = {
  id: 'default',
  minGapBetweenClasses: 0,
  maxConsecutiveHours: 4,
  lunchBreakRequired: true,
  lunchBreakStart: '13:00',
  lunchBreakEnd: '14:00',
  avoidBackToBackSameSubject: true,
  preferredStartTime: '09:00',
  preferredEndTime: '17:00',
};

export const storage = {
  // Departments
  getDepartments: (): Department[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveDepartments: (departments: Department[]) => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  },

  // Teachers
  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return data ? JSON.parse(data) : [];
  },
  saveTeachers: (teachers: Teacher[]) => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  // Subjects
  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : [];
  },
  saveSubjects: (subjects: Subject[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  // Rooms
  getRooms: (): Room[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : [];
  },
  saveRooms: (rooms: Room[]) => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  // Sections
  getSections: (): Section[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SECTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveSections: (sections: Section[]) => {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  },

  // Timetables
  getTimetables: (): GeneratedTimetable[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TIMETABLES);
    return data ? JSON.parse(data) : [];
  },
  saveTimetable: (timetable: GeneratedTimetable) => {
    const timetables = storage.getTimetables();
    timetables.push(timetable);
    localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(timetables));
  },
  deleteTimetable: (id: string) => {
    const timetables = storage.getTimetables().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(timetables));
  },

  // Breaks
  getBreaks: (): BreakTime[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BREAKS);
    return data ? JSON.parse(data) : [];
  },
  saveBreaks: (breaks: BreakTime[]) => {
    localStorage.setItem(STORAGE_KEYS.BREAKS, JSON.stringify(breaks));
  },

  // Preferences
  getPreferences: (): SchedulingPreferences => {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : DEFAULT_PREFERENCES;
  },
  savePreferences: (preferences: SchedulingPreferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  },
};
