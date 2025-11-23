import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, PieChart, TrendingUp, Users, DoorOpen, BookOpen } from "lucide-react";
import { storage } from "@/lib/storage";

interface RoomUtilization {
  roomId: string;
  roomName: string;
  totalSlots: number;
  usedSlots: number;
  utilization: number;
}

interface TeacherWorkload {
  teacherId: string;
  teacherName: string;
  assignedHours: number;
  maxHours: number;
  utilization: number;
}

const Statistics = () => {
  const [roomStats, setRoomStats] = useState<RoomUtilization[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherWorkload[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    avgClassSize: 0,
    peakDay: '',
    peakTime: '',
  });

  useEffect(() => {
    calculateStatistics();
  }, []);

  const calculateStatistics = () => {
    const timetables = storage.getTimetables();
    if (timetables.length === 0) return;

    const latestTimetable = timetables[timetables.length - 1];
    const rooms = storage.getRooms();
    const teachers = storage.getTeachers();
    const sections = storage.getSections();

    // Room utilization
    const totalSlotsPerRoom = 7 * 5; // 7 time slots * 5 days
    const roomUsage = new Map<string, number>();

    latestTimetable.entries.forEach(entry => {
      roomUsage.set(entry.roomId, (roomUsage.get(entry.roomId) || 0) + 1);
    });

    const roomUtilization: RoomUtilization[] = rooms.map(room => ({
      roomId: room.id,
      roomName: room.name,
      totalSlots: totalSlotsPerRoom,
      usedSlots: roomUsage.get(room.id) || 0,
      utilization: ((roomUsage.get(room.id) || 0) / totalSlotsPerRoom) * 100,
    }));

    setRoomStats(roomUtilization);

    // Teacher workload
    const teacherHours = new Map<string, number>();

    latestTimetable.entries.forEach(entry => {
      teacherHours.set(entry.teacherId, (teacherHours.get(entry.teacherId) || 0) + 1);
    });

    const teacherWorkload: TeacherWorkload[] = teachers.map(teacher => ({
      teacherId: teacher.id,
      teacherName: teacher.name,
      assignedHours: teacherHours.get(teacher.id) || 0,
      maxHours: teacher.maxHoursPerWeek,
      utilization: ((teacherHours.get(teacher.id) || 0) / teacher.maxHoursPerWeek) * 100,
    }));

    setTeacherStats(teacherWorkload);

    // Overall stats
    const dayCount = new Map<string, number>();
    const timeCount = new Map<string, number>();

    latestTimetable.entries.forEach(entry => {
      dayCount.set(entry.timeSlot.day, (dayCount.get(entry.timeSlot.day) || 0) + 1);
      timeCount.set(entry.timeSlot.startTime, (timeCount.get(entry.timeSlot.startTime) || 0) + 1);
    });

    const peakDay = Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const peakTime = Array.from(timeCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const totalStudents = sections.reduce((sum, s) => sum + s.studentCount, 0);
    const avgClassSize = sections.length > 0 ? Math.round(totalStudents / sections.length) : 0;

    setOverallStats({
      totalClasses: latestTimetable.entries.length,
      avgClassSize,
      peakDay,
      peakTime,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            Statistics & Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights from your latest generated timetable
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalClasses}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.avgClassSize}</div>
              <p className="text-xs text-muted-foreground">students per section</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Busiest Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.peakDay}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.peakTime}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Room Utilization */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5" />
                Room Utilization
              </CardTitle>
              <CardDescription>How efficiently rooms are being used</CardDescription>
            </CardHeader>
            <CardContent>
              {roomStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Generate a timetable to see statistics</p>
              ) : (
                <div className="space-y-4">
                  {roomStats.map((room) => (
                    <div key={room.roomId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{room.roomName}</span>
                        <span className="text-muted-foreground">
                          {room.usedSlots}/{room.totalSlots} slots
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={room.utilization} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {room.utilization.toFixed(1)}% utilized
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Workload */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Teacher Workload
              </CardTitle>
              <CardDescription>Distribution of teaching hours</CardDescription>
            </CardHeader>
            <CardContent>
              {teacherStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Generate a timetable to see statistics</p>
              ) : (
                <div className="space-y-4">
                  {teacherStats.map((teacher) => (
                    <div key={teacher.teacherId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{teacher.teacherName}</span>
                        <span className="text-muted-foreground">
                          {teacher.assignedHours}/{teacher.maxHours} hours
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={teacher.utilization} 
                          className={`h-2 ${teacher.utilization > 90 ? 'bg-red-200' : ''}`}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {teacher.utilization.toFixed(1)}% of capacity
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-6 shadow-card border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Insights to improve your timetable</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {roomStats.some(r => r.utilization < 30) && (
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Some rooms have low utilization (&lt;30%). Consider consolidating classes or repurposing underutilized rooms.</span>
                </li>
              )}
              {teacherStats.some(t => t.utilization > 90) && (
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Some teachers are near maximum capacity (&gt;90%). Consider redistributing workload or hiring additional faculty.</span>
                </li>
              )}
              {roomStats.some(r => r.utilization > 80) && (
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>High room utilization (&gt;80%) detected. Excellent space optimization!</span>
                </li>
              )}
              {teacherStats.some(t => t.utilization < 40) && (
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Some teachers have light workloads (&lt;40%). They may be able to take on additional subjects or sections.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;
