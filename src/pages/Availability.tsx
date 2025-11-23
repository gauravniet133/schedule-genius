import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
import { storage } from "@/lib/storage";
import { Teacher, TimeSlot } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Availability = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setTeachers(storage.getTeachers());
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      const teacher = teachers.find(t => t.id === selectedTeacherId);
      setAvailability(teacher?.availability || []);
    }
  }, [selectedTeacherId, teachers]);

  const toggleSlot = (day: typeof days[number], time: string) => {
    const existingIndex = availability.findIndex(
      slot => slot.day === day && slot.startTime === time
    );

    if (existingIndex !== -1) {
      // Remove slot
      setAvailability(availability.filter((_, i) => i !== existingIndex));
    } else {
      // Add slot
      const endTimeIndex = timeSlots.indexOf(time) + 1;
      const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : '18:00';
      
      setAvailability([...availability, {
        day,
        startTime: time,
        endTime
      }]);
    }
  };

  const isSlotAvailable = (day: string, time: string) => {
    return availability.some(
      slot => slot.day === day && slot.startTime === time
    );
  };

  const handleSave = () => {
    if (!selectedTeacherId) return;

    const updatedTeachers = teachers.map(teacher =>
      teacher.id === selectedTeacherId
        ? { ...teacher, availability }
        : teacher
    );

    setTeachers(updatedTeachers);
    storage.saveTeachers(updatedTeachers);

    toast({
      title: "Availability saved",
      description: "Teacher availability has been updated successfully.",
    });
  };

  const handleClearAll = () => {
    setAvailability([]);
  };

  const handleSetAllAvailable = () => {
    const allSlots: TimeSlot[] = [];
    days.forEach(day => {
      timeSlots.forEach((time, index) => {
        const endTimeIndex = index + 1;
        const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : '18:00';
        allSlots.push({ day, startTime: time, endTime });
      });
    });
    setAvailability(allSlots);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Teacher Availability
          </h1>
          <p className="text-muted-foreground">
            Manage when teachers are available for classes
          </p>
        </div>

        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Select Teacher</CardTitle>
            <CardDescription>Choose a teacher to manage their availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedTeacherId && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Availability Calendar</CardTitle>
                  <CardDescription>
                    Click on time slots to mark availability (green = available)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSetAllAvailable}>
                    Set All Available
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left font-semibold">Time</th>
                      {days.map(day => (
                        <th key={day} className="border border-border p-3 text-center font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="border border-border p-3 font-medium bg-muted/30">
                          {time}
                        </td>
                        {days.map(day => {
                          const available = isSlotAvailable(day, time);
                          return (
                            <td
                              key={day}
                              className={cn(
                                "border border-border p-3 cursor-pointer transition-colors hover:opacity-80",
                                available
                                  ? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40"
                                  : "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                              )}
                              onClick={() => toggleSlot(day, time)}
                            >
                              <div className="flex items-center justify-center h-12">
                                {available ? (
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-red-400 dark:text-red-500">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Total available slots: {availability.length} / {days.length * timeSlots.length}
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedTeacherId && (
          <Card className="p-12 text-center border-dashed">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a teacher to manage their availability</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Availability;
