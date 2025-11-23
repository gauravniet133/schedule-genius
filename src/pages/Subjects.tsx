import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Plus, Trash2, Beaker } from "lucide-react";
import { storage } from "@/lib/storage";
import { Subject, Department, Teacher } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
    setSubjects(storage.getSubjects());
    setDepartments(storage.getDepartments());
    setTeachers(storage.getTeachers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      departmentId: formData.departmentId,
      hoursPerWeek: formData.hoursPerWeek,
      requiresLab: formData.requiresLab,
      assignedTeacherId: formData.assignedTeacherId || undefined,
    };

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    storage.saveSubjects(updated);
    
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
  };

  const handleDelete = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    storage.saveSubjects(updated);
    
    toast({
      title: "Subject deleted",
      description: "The subject has been removed.",
      variant: "destructive",
    });
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || "Unknown";
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "Unassigned";
    return teachers.find(t => t.id === teacherId)?.name || "Unknown";
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
                <Button type="submit" className="w-full">Add Subject</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {subject.name}
                    {subject.requiresLab && <Beaker className="w-4 h-4 text-accent" />}
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
                    Department: {getDepartmentName(subject.departmentId)}
                  </div>
                  <div className="text-muted-foreground">
                    Teacher: {getTeacherName(subject.assignedTeacherId)}
                  </div>
                  <div className="text-muted-foreground">
                    {subject.hoursPerWeek} hours/week
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
      </main>
    </div>
  );
};

export default Subjects;
