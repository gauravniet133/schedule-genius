import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UsersRound, Plus, Trash2, BookOpen } from "lucide-react";
import { storage } from "@/lib/storage";
import { Section, Department, Subject } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";

const Sections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    departmentId: "",
    semester: 1,
    studentCount: 30,
    subjects: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    setSections(storage.getSections());
    setDepartments(storage.getDepartments());
    setSubjects(storage.getSubjects());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: formData.name,
      departmentId: formData.departmentId,
      semester: formData.semester,
      studentCount: formData.studentCount,
      subjects: formData.subjects,
    };

    const updated = [...sections, newSection];
    setSections(updated);
    storage.saveSections(updated);
    
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
  };

  const handleDelete = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    storage.saveSections(updated);
    
    toast({
      title: "Section deleted",
      description: "The section has been removed.",
      variant: "destructive",
    });
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || "Unknown";
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || "Unknown";
  };

  const toggleSubject = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const availableSubjects = subjects.filter(s => s.departmentId === formData.departmentId);

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
                <Button type="submit" className="w-full" disabled={formData.subjects.length === 0}>
                  Add Section
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
                  {getDepartmentName(section.departmentId)} • Semester {section.semester}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UsersRound className="w-4 h-4" />
                    {section.studentCount} students
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span className="font-medium">Subjects ({section.subjects.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {section.subjects.slice(0, 3).map(subjectId => (
                        <span key={subjectId} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getSubjectName(subjectId)}
                        </span>
                      ))}
                      {section.subjects.length > 3 && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          +{section.subjects.length - 3} more
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
      </main>
    </div>
  );
};

export default Sections;
