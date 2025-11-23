import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertCircle, CheckCircle, Loader2, Download, Eye, Users, DoorOpen, BookOpen } from "lucide-react";
import { storage } from "@/lib/storage";
import { EnhancedTimetableGenerator } from "@/lib/enhancedTimetableGenerator";
import { GeneratedTimetable } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Generate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetables, setTimetables] = useState<GeneratedTimetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<GeneratedTimetable | null>(null);
  const [viewMode, setViewMode] = useState<'section' | 'teacher' | 'room'>('section');
  const { toast } = useToast();

  useEffect(() => {
    setTimetables(storage.getTimetables());
  }, []);

  const handleGenerate = async () => {
    const teachers = storage.getTeachers();
    const subjects = storage.getSubjects();
    const rooms = storage.getRooms();
    const sections = storage.getSections();

    if (teachers.length === 0 || subjects.length === 0 || rooms.length === 0 || sections.length === 0) {
      toast({
        title: "Cannot generate timetable",
        description: "Please ensure you have added teachers, subjects, rooms, and sections.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate generation delay for better UX
    setTimeout(() => {
      const breaks = storage.getBreaks();
      const preferences = storage.getPreferences();
      
      const generator = new EnhancedTimetableGenerator(
        teachers, 
        subjects, 
        rooms, 
        sections, 
        breaks, 
        preferences
      );
      const result = generator.generate();
      
      storage.saveTimetable(result);
      setTimetables([...timetables, result]);
      
      setIsGenerating(false);
      
      toast({
        title: "Timetable generated!",
        description: `Generated with ${result.conflicts} conflicts`,
      });
    }, 2000);
  };

  const handleView = (timetable: GeneratedTimetable) => {
    setSelectedTimetable(timetable);
  };

  const handleDelete = (id: string) => {
    storage.deleteTimetable(id);
    setTimetables(timetables.filter(t => t.id !== id));
    toast({
      title: "Timetable deleted",
      description: "The timetable has been removed.",
      variant: "destructive",
    });
  };

  const exportToCSV = (timetable: GeneratedTimetable) => {
    const headers = ['Section', 'Subject', 'Teacher', 'Room', 'Day', 'Start Time', 'End Time'];
    const rows = timetable.entries.map(entry => {
      const section = storage.getSections().find(s => s.id === entry.sectionId);
      const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
      const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);
      const room = storage.getRooms().find(r => r.id === entry.roomId);
      
      return [
        section?.name || '',
        subject?.name || '',
        teacher?.name || '',
        room?.name || '',
        entry.timeSlot.day,
        entry.timeSlot.startTime,
        entry.timeSlot.endTime
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${timetable.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Timetable exported to CSV",
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="w-8 h-8 text-primary" />
            Generate Timetable
          </h1>

          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              The system will automatically generate conflict-free timetables based on your constraints.
              Make sure all your data is entered before generating.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Generate New Timetable
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Generated Timetables</h2>

          {timetables.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No timetables generated yet. Click the button above to generate your first timetable.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {timetables.map((timetable) => (
                <Card key={timetable.id} className="shadow-card hover:shadow-elevated transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {timetable.name}
                          {timetable.conflicts === 0 ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              No Conflicts
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {timetable.conflicts} Conflicts
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Generated on {new Date(timetable.generatedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(timetable)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToCSV(timetable)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(timetable.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {timetable.entries.length} classes scheduled
                      </p>
                      {timetable.constraints.filter(c => c.violated).length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium mb-1">Issues:</p>
                          <ul className="space-y-1">
                            {timetable.constraints.filter(c => c.violated).slice(0, 3).map((constraint, idx) => (
                              <li key={idx} className="text-destructive flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {constraint.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedTimetable} onOpenChange={() => setSelectedTimetable(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Timetable View - {selectedTimetable?.name}</span>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                <TabsList>
                  <TabsTrigger value="section" className="gap-1">
                    <Users className="w-4 h-4" />
                    Sections
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="gap-1">
                    <BookOpen className="w-4 h-4" />
                    Teachers
                  </TabsTrigger>
                  <TabsTrigger value="room" className="gap-1">
                    <DoorOpen className="w-4 h-4" />
                    Rooms
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTimetable && (
            <div className="space-y-6">
              {/* Section View */}
              {viewMode === 'section' && storage.getSections().map(section => {
                const sectionEntries = selectedTimetable.entries.filter(e => e.sectionId === section.id);
                if (sectionEntries.length === 0) return null;

                return (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left font-semibold">Time</th>
                            {days.map(day => (
                              <th key={day} className="border border-border p-2 text-center font-semibold">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map(time => (
                            <tr key={time}>
                              <td className="border border-border p-2 font-medium bg-muted/30">{time}</td>
                              {days.map(day => {
                                const entry = sectionEntries.find(
                                  e => e.timeSlot.day === day && e.timeSlot.startTime === time
                                );
                                
                                if (!entry) {
                                  return <td key={day} className="border border-border p-2 bg-muted/20"></td>;
                                }

                                const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
                                const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);
                                const room = storage.getRooms().find(r => r.id === entry.roomId);

                                return (
                                  <td key={day} className="border border-border p-2 bg-primary/5">
                                    <div className="text-xs">
                                      <p className="font-semibold">{subject?.name}</p>
                                      <p className="text-muted-foreground">{teacher?.name}</p>
                                      <p className="text-muted-foreground">{room?.name}</p>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Teacher View */}
              {viewMode === 'teacher' && storage.getTeachers().map(teacher => {
                const teacherEntries = selectedTimetable.entries.filter(e => e.teacherId === teacher.id);
                if (teacherEntries.length === 0) return null;

                return (
                  <div key={teacher.id} className="space-y-2">
                    <h3 className="text-lg font-semibold">{teacher.name}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left font-semibold">Time</th>
                            {days.map(day => (
                              <th key={day} className="border border-border p-2 text-center font-semibold">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map(time => (
                            <tr key={time}>
                              <td className="border border-border p-2 font-medium bg-muted/30">{time}</td>
                              {days.map(day => {
                                const entry = teacherEntries.find(
                                  e => e.timeSlot.day === day && e.timeSlot.startTime === time
                                );
                                
                                if (!entry) {
                                  return <td key={day} className="border border-border p-2 bg-muted/20"></td>;
                                }

                                const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
                                const section = storage.getSections().find(s => s.id === entry.sectionId);
                                const room = storage.getRooms().find(r => r.id === entry.roomId);

                                return (
                                  <td key={day} className="border border-border p-2 bg-accent/5">
                                    <div className="text-xs">
                                      <p className="font-semibold">{subject?.name}</p>
                                      <p className="text-muted-foreground">{section?.name}</p>
                                      <p className="text-muted-foreground">{room?.name}</p>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Room View */}
              {viewMode === 'room' && storage.getRooms().map(room => {
                const roomEntries = selectedTimetable.entries.filter(e => e.roomId === room.id);
                if (roomEntries.length === 0) return null;

                return (
                  <div key={room.id} className="space-y-2">
                    <h3 className="text-lg font-semibold">{room.name} ({room.type})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left font-semibold">Time</th>
                            {days.map(day => (
                              <th key={day} className="border border-border p-2 text-center font-semibold">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map(time => (
                            <tr key={time}>
                              <td className="border border-border p-2 font-medium bg-muted/30">{time}</td>
                              {days.map(day => {
                                const entry = roomEntries.find(
                                  e => e.timeSlot.day === day && e.timeSlot.startTime === time
                                );
                                
                                if (!entry) {
                                  return <td key={day} className="border border-border p-2 bg-green-50 dark:bg-green-900/10"></td>;
                                }

                                const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
                                const section = storage.getSections().find(s => s.id === entry.sectionId);
                                const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);

                                return (
                                  <td key={day} className="border border-border p-2 bg-red-50 dark:bg-red-900/10">
                                    <div className="text-xs">
                                      <p className="font-semibold">{subject?.name}</p>
                                      <p className="text-muted-foreground">{section?.name}</p>
                                      <p className="text-muted-foreground">{teacher?.name}</p>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Generate;
