import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Loader2, Download, Eye } from "lucide-react";
import { storage } from "@/lib/storage";
import { TimetableGenerator } from "@/lib/timetableGenerator";
import { GeneratedTimetable } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Generate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timetables, setTimetables] = useState<GeneratedTimetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<GeneratedTimetable | null>(null);
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
      const generator = new TimetableGenerator(teachers, subjects, rooms, sections);
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timetable View - {selectedTimetable?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedTimetable && (
            <div className="space-y-6">
              {storage.getSections().map(section => {
                const sectionEntries = selectedTimetable.entries.filter(e => e.sectionId === section.id);
                if (sectionEntries.length === 0) return null;

                return (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left">Time</th>
                            {days.map(day => (
                              <th key={day} className="border border-border p-2 text-center">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map(time => (
                            <tr key={time}>
                              <td className="border border-border p-2 font-medium">{time}</td>
                              {days.map(day => {
                                const entry = sectionEntries.find(
                                  e => e.timeSlot.day === day && e.timeSlot.startTime === time
                                );
                                
                                if (!entry) {
                                  return <td key={day} className="border border-border p-2 bg-muted/30"></td>;
                                }

                                const subject = storage.getSubjects().find(s => s.id === entry.subjectId);
                                const teacher = storage.getTeachers().find(t => t.id === entry.teacherId);
                                const room = storage.getRooms().find(r => r.id === entry.roomId);

                                return (
                                  <td key={day} className="border border-border p-2 bg-primary/5">
                                    <div className="text-sm">
                                      <p className="font-semibold">{subject?.name}</p>
                                      <p className="text-xs text-muted-foreground">{teacher?.name}</p>
                                      <p className="text-xs text-muted-foreground">{room?.name}</p>
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
