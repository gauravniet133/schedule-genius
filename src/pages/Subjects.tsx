import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Plus, Trash2, Beaker, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
  hours_per_week: number;
  requires_lab: boolean;
  assigned_teacher_id: string | null;
  departments: { name: string };
  teachers: { name: string } | null;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    code: "", 
    departmentId: "",
    hoursPerWeek: 3,
    requiresLab: false,
    assignedTeacherId: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subjectsRes, departmentsRes, teachersRes] = await Promise.all([
        supabase
          .from("subjects")
          .select("*, departments(name), teachers(name)")
          .order("name"),
        supabase
          .from("departments")
          .select("id, name")
          .order("name"),
        supabase
          .from("teachers")
          .select("id, name")
          .order("name")
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
      if (departmentsRes.error) throw departmentsRes.error;
      if (teachersRes.error) throw teachersRes.error;

      setSubjects(subjectsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setTeachers(teachersRes.data || []);
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
      const { error } = await supabase
        .from("subjects")
        .insert([{
          name: formData.name,
          code: formData.code,
          department_id: formData.departmentId,
          hours_per_week: formData.hoursPerWeek,
          requires_lab: formData.requiresLab,
          assigned_teacher_id: formData.assignedTeacherId || null,
        }]);

      if (error) throw error;

      toast({
        title: "Subject added",
        description: `${formData.name} has been added successfully.`,
      });

      setFormData({ 
        name: "", 
        code: "", 
        departmentId: "",
        hoursPerWeek: 3,
        requiresLab: false,
        assignedTeacherId: ""
      });
      setIsOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding subject",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Subject deleted",
        description: "The subject has been removed.",
      });

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting subject",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Subjects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage courses and subjects
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent hover:opacity-90">
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Add a course or subject to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Data Structures"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS201"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
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
                  <Label htmlFor="teacher">Assigned Teacher</Label>
                  <Select 
                    value={formData.assignedTeacherId} 
                    onValueChange={(value) => setFormData({ ...formData, assignedTeacherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hours">Hours Per Week</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lab">Requires Lab</Label>
                  <Switch
                    id="lab"
                    checked={formData.requiresLab}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresLab: checked })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Subject"
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
            {subjects.map((subject) => (
              <Card key={subject.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {subject.name}
                      {subject.requires_lab && <Beaker className="w-4 h-4 text-accent" />}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subject.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>Code: {subject.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="text-muted-foreground">
                      Department: {subject.departments.name}
                    </div>
                    <div className="text-muted-foreground">
                      Teacher: {subject.teachers?.name || "Unassigned"}
                    </div>
                    <div className="text-muted-foreground">
                      {subject.hours_per_week} hours/week
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {subjects.length === 0 && (
              <Card className="col-span-full p-12 text-center border-dashed">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No subjects yet. Add your first subject to get started.</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Subjects;
