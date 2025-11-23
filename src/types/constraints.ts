export interface BreakTime {
  id: string;
  name: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
}

export interface SchedulingPreferences {
  id: string;
  minGapBetweenClasses: number; // minutes
  maxConsecutiveHours: number;
  lunchBreakRequired: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
  avoidBackToBackSameSubject: boolean;
  preferredStartTime: string;
  preferredEndTime: string;
}

export interface ConflictDetails {
  type: 'teacher_conflict' | 'room_conflict' | 'section_conflict' | 'availability_conflict' | 'break_conflict';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedEntities: string[];
  suggestion?: string;
}
