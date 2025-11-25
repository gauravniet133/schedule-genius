import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  department_id: string;
  max_hours_per_week: number;
  departments: { name: string };
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    departmentId: "",
    maxHoursPerWeek: 40
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teachersRes, departmentsRes] = await Promise.all([
        supabase
          .from("teachers")
          .select("*, departments(name)")
          .order("name"),
        supabase
          .from("departments")
          .select("id, name")
          .order("name")
      ]);

      if (teachersRes.error) throw teachersRes.error;
      if (departmentsRes.error) throw departmentsRes.error;

      setTeachers(teachersRes.data || []);
      setDepartments(departmentsRes.data || []);
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
        .from("teachers")
        .insert([{
          name: formData.name,
          email: formData.email,
          department_id: formData.departmentId,
          max_hours_per_week: formData.maxHoursPerWeek,
        }]);

      if (error) throw error;

      toast({
        title: "Teacher added",
        description: `${formData.name} has been added successfully.`,
      });

      setFormData({ name: "", email: "", departmentId: "", maxHoursPerWeek: 40 });
      setIsOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding teacher",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Teacher deleted",
        description: "The teacher has been removed.",
      });

      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting teacher",
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
              <Users className="w-8 h-8 text-primary" />
              Teachers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage faculty members
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent hover:opacity-90">
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Add a faculty member to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.smith@university.edu"
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
                  <Label htmlFor="maxHours">Max Hours Per Week</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.maxHoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Teacher"
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
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="shadow-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{teacher.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(teacher.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>{teacher.departments.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {teacher.email}
                    </div>
                    <div className="text-muted-foreground">
                      Max hours: {teacher.max_hours_per_week}/week
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {teachers.length === 0 && (
              <Card className="col-span-full p-12 text-center border-dashed">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No teachers yet. Add your first teacher to get started.</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Teachers;
