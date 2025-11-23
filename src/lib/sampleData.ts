import { Department, Teacher, Subject, Room, Section } from '@/types/timetable';

export const generateSampleData = () => {
  // Sample Departments
  const departments: Department[] = [
    { id: crypto.randomUUID(), name: 'Computer Science', code: 'CS' },
    { id: crypto.randomUUID(), name: 'Mathematics', code: 'MATH' },
    { id: crypto.randomUUID(), name: 'Physics', code: 'PHY' },
  ];

  // Sample Teachers
  const teachers: Teacher[] = [
    {
      id: crypto.randomUUID(),
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      departmentId: departments[0].id,
      availability: [],
      maxHoursPerWeek: 20,
    },
    {
      id: crypto.randomUUID(),
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      departmentId: departments[0].id,
      availability: [],
      maxHoursPerWeek: 18,
    },
    {
      id: crypto.randomUUID(),
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      departmentId: departments[1].id,
      availability: [],
      maxHoursPerWeek: 20,
    },
    {
      id: crypto.randomUUID(),
      name: 'Prof. David Kim',
      email: 'david.kim@university.edu',
      departmentId: departments[2].id,
      availability: [],
      maxHoursPerWeek: 16,
    },
    {
      id: crypto.randomUUID(),
      name: 'Dr. Amanda Williams',
      email: 'amanda.williams@university.edu',
      departmentId: departments[0].id,
      availability: [],
      maxHoursPerWeek: 22,
    },
  ];

  // Sample Subjects
  const subjects: Subject[] = [
    {
      id: crypto.randomUUID(),
      name: 'Data Structures',
      code: 'CS201',
      departmentId: departments[0].id,
      hoursPerWeek: 3,
      requiresLab: true,
      assignedTeacherId: teachers[0].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Algorithms',
      code: 'CS301',
      departmentId: departments[0].id,
      hoursPerWeek: 4,
      requiresLab: false,
      assignedTeacherId: teachers[1].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Database Systems',
      code: 'CS302',
      departmentId: departments[0].id,
      hoursPerWeek: 3,
      requiresLab: true,
      assignedTeacherId: teachers[4].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Linear Algebra',
      code: 'MATH201',
      departmentId: departments[1].id,
      hoursPerWeek: 3,
      requiresLab: false,
      assignedTeacherId: teachers[2].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Calculus II',
      code: 'MATH202',
      departmentId: departments[1].id,
      hoursPerWeek: 4,
      requiresLab: false,
      assignedTeacherId: teachers[2].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Quantum Mechanics',
      code: 'PHY301',
      departmentId: departments[2].id,
      hoursPerWeek: 3,
      requiresLab: true,
      assignedTeacherId: teachers[3].id,
    },
  ];

  // Sample Rooms
  const rooms: Room[] = [
    {
      id: crypto.randomUUID(),
      name: 'Room 101',
      type: 'classroom',
      capacity: 40,
      departmentId: departments[0].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Room 102',
      type: 'classroom',
      capacity: 35,
      departmentId: departments[0].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Lab A1',
      type: 'lab',
      capacity: 30,
      departmentId: departments[0].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Lab A2',
      type: 'lab',
      capacity: 25,
      departmentId: departments[0].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Room 201',
      type: 'classroom',
      capacity: 45,
      departmentId: departments[1].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Physics Lab',
      type: 'lab',
      capacity: 28,
      departmentId: departments[2].id,
    },
    {
      id: crypto.randomUUID(),
      name: 'Auditorium',
      type: 'auditorium',
      capacity: 150,
    },
  ];

  // Sample Sections
  const csSubjects = subjects.filter(s => s.departmentId === departments[0].id).map(s => s.id);
  const mathSubjects = subjects.filter(s => s.departmentId === departments[1].id).map(s => s.id);
  const phySubjects = subjects.filter(s => s.departmentId === departments[2].id).map(s => s.id);

  const sections: Section[] = [
    {
      id: crypto.randomUUID(),
      name: 'CS-A',
      departmentId: departments[0].id,
      semester: 3,
      studentCount: 35,
      subjects: csSubjects,
    },
    {
      id: crypto.randomUUID(),
      name: 'CS-B',
      departmentId: departments[0].id,
      semester: 3,
      studentCount: 32,
      subjects: csSubjects,
    },
    {
      id: crypto.randomUUID(),
      name: 'MATH-A',
      departmentId: departments[1].id,
      semester: 2,
      studentCount: 40,
      subjects: mathSubjects,
    },
    {
      id: crypto.randomUUID(),
      name: 'PHY-A',
      departmentId: departments[2].id,
      semester: 5,
      studentCount: 28,
      subjects: phySubjects,
    },
  ];

  return { departments, teachers, subjects, rooms, sections };
};
