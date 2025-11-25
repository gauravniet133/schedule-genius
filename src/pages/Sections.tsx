import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UsersRound, Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
}

interface Section {
  id: string;
  name: string;
  department_id: string;
  semester: number;
  student_count: number;
  departments: { name: string };
  section_subjects: { subject_id: string; subjects: { name: string; code: string } }[];
}

const Sections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    departmentId: "",
    semester: 1,
    studentCount: 30,
    subjects: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsRes, departmentsRes, subjectsRes] = await Promise.all([
        supabase
          .from("sections")
          .select(`
            *,
            departments(name),
            section_subjects(subject_id, subjects(name, code))
          `)
          .order("name"),
        supabase
          .from("departments")
          .select("id, name")
          .order("name"),
        supabase
          .from("subjects")
          .select("id, name, code, department_id")
          .order("name")
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (departmentsRes.error) throw departmentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setSections(sectionsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .insert([{
          name: formData.name,
          department_id: formData.departmentId,
          semester: formData.semester,
          student_count: formData.studentCount,
        }])
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Insert section-subject relationships
      if (formData.subjects.length > 0) {
        const { error: relationError } = await supabase
          .from("section_subjects")
          .insert(
            formData.subjects.map(subjectId => ({
              section_id: sectionData.id,
              subject_id: subjectId,
            }))
          );

        if (relationError) throw relationError;
      }

      toast({
        title: "Section added",
        description: `${formData.name} has been added successfully.`,
      });

      setFormData({ 
        name: "", 
        departmentId: "",
        semester: 1,
        studentCount: 30,
        subjects: []
      });
      setIsOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding section",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete section (section_subjects will cascade delete due to foreign key)
      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Section deleted",
        description: "The section has been removed.",
      });

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting section",
        description: error.message,
      });
    }
  };

  const toggleSubject = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const availableSubjects = subjects.filter(s => s.department_id === formData.departmentId);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UsersRound className="w-8 h-8 text-primary" />
              Sections
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student sections and classes
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent hover:opacity-90">
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>
                  Create a student section with assigned subjects
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Section Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="CS-A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value, subjects: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="students">Number of Students</Label>
                  <Input
                    id="students"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Subjects</Label>
                  {formData.departmentId ? (
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availableSubjects.length > 0 ? (
                        availableSubjects.map((subject) => (
                          <div key={subject.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject.id}
                              checked={formData.subjects.includes(subject.id)}
                              onCheckedChange={() => toggleSubject(subject.id)}
                            />
                            <label
                              htmlFor={subject.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {subject.name} ({subject.code})
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No subjects available for this department</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">Select a department first</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={formData.subjects.length === 0 || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Section"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{section.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(section.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {section.departments.name} • Semester {section.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UsersRound className="w-4 h-4" />
                      {section.student_count} students
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">Subjects ({section.section_subjects.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {section.section_subjects.slice(0, 3).map(ss => (
                          <span key={ss.subject_id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {ss.subjects.name}
                          </span>
                        ))}
                        {section.section_subjects.length > 3 && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            +{section.section_subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sections.length === 0 && (
              <Card className="col-span-full p-12 text-center border-dashed">
                <UsersRound className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sections yet. Add your first section to get started.</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sections;
