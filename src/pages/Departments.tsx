import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { Department } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const { toast } = useToast();

  useEffect(() => {
    setDepartments(storage.getDepartments());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDepartment: Department = {
      id: crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
    };

    const updated = [...departments, newDepartment];
    setDepartments(updated);
    storage.saveDepartments(updated);
    
    toast({
      title: "Department added",
      description: `${formData.name} has been added successfully.`,
    });

    setFormData({ name: "", code: "" });
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = departments.filter(d => d.id !== id);
    setDepartments(updated);
    storage.saveDepartments(updated);
    
    toast({
      title: "Department deleted",
      description: "The department has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Departments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage academic departments
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent hover:opacity-90">
                <Plus className="w-4 h-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Create a new academic department
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Computer Science"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Department</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dept.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(dept.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Code: {dept.code}</CardDescription>
              </CardHeader>
            </Card>
          ))}

          {departments.length === 0 && (
            <Card className="col-span-full p-12 text-center border-dashed">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No departments yet. Add your first department to get started.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Departments;
