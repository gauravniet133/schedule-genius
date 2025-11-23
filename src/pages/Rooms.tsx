import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoorOpen, Plus, Trash2, Users } from "lucide-react";
import { storage } from "@/lib/storage";
import { Room, Department } from "@/types/timetable";
import { useToast } from "@/hooks/use-toast";

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    type: "classroom" as Room['type'],
    capacity: 30,
    departmentId: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    setRooms(storage.getRooms());
    setDepartments(storage.getDepartments());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      departmentId: formData.departmentId || undefined,
    };

    const updated = [...rooms, newRoom];
    setRooms(updated);
    storage.saveRooms(updated);
    
    toast({
      title: "Room added",
      description: `${formData.name} has been added successfully.`,
    });

    setFormData({ 
      name: "", 
      type: "classroom",
      capacity: 30,
      departmentId: ""
    });
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = rooms.filter(r => r.id !== id);
    setRooms(updated);
    storage.saveRooms(updated);
    
    toast({
      title: "Room deleted",
      description: "The room has been removed.",
      variant: "destructive",
    });
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return "General";
    return departments.find(d => d.id === departmentId)?.name || "Unknown";
  };

  const getTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'lab':
        return 'text-accent';
      case 'auditorium':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <DoorOpen className="w-8 h-8 text-primary" />
              Rooms
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage classrooms and labs
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-accent hover:opacity-90">
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Add a classroom or lab to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Room Name/Number</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Room 101"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Room Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as Room['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select 
                    value={formData.departmentId} 
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="General/Shared" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General/Shared</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Add Room</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{room.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(room.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription className={getTypeColor(room.type)}>
                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Capacity: {room.capacity}
                  </div>
                  <div className="text-muted-foreground">
                    {getDepartmentName(room.departmentId)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {rooms.length === 0 && (
            <Card className="col-span-full p-12 text-center border-dashed">
              <DoorOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rooms yet. Add your first room to get started.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rooms;
