import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

interface Section {
  id: string;
  name: string;
  department_id: string;
  departments: { name: string };
}

interface TimetableEntry {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subjects: { name: string; code: string };
  teachers: { name: string };
  rooms: { name: string };
}

export default function StudentPortal() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadTimetable();
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("id, name, department_id, departments(name)")
        .order("name");

      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sections",
      });
    }
  };

  const loadTimetable = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`
          id,
          day,
          start_time,
          end_time,
          subjects(name, code),
          teachers(name),
          rooms(name)
        `)
        .eq("section_id", selectedSection)
        .order("day")
        .order("start_time");

      if (error) throw error;
      setTimetableEntries(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load timetable",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEntriesForDay = (day: string) => {
    return timetableEntries.filter((entry) => entry.day === day);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Student Portal
          </h1>
          <p className="text-muted-foreground">View your class schedule</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Your Section</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Choose your section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name} - {section.departments.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedSection && (
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  Loading timetable...
                </CardContent>
              </Card>
            ) : timetableEntries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No timetable available for this section yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {days.map((day) => {
                  const dayEntries = getEntriesForDay(day);
                  if (dayEntries.length === 0) return null;

                  return (
                    <Card key={day}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {day}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-4 p-4 rounded-lg bg-accent/10 border border-accent/20"
                            >
                              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                                </span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="font-semibold">
                                  {entry.subjects.name} ({entry.subjects.code})
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Teacher: {entry.teachers.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Room: {entry.rooms.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
