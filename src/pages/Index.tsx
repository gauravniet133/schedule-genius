import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";
import { Navigation } from "@/components/Navigation";
import { storage } from "@/lib/storage";
import { 
  Building2, 
  Users, 
  BookOpen, 
  DoorOpen, 
  UsersRound,
  Calendar,
  AlertCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [stats, setStats] = useState({
    departments: 0,
    teachers: 0,
    subjects: 0,
    rooms: 0,
    sections: 0,
    timetables: 0,
  });

  useEffect(() => {
    setStats({
      departments: storage.getDepartments().length,
      teachers: storage.getTeachers().length,
      subjects: storage.getSubjects().length,
      rooms: storage.getRooms().length,
      sections: storage.getSections().length,
      timetables: storage.getTimetables().length,
    });
  }, []);

  const isReadyToGenerate = stats.departments > 0 && stats.teachers > 0 && 
    stats.subjects > 0 && stats.rooms > 0 && stats.sections > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to SmartSchedule
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Intelligent automated timetable generation for universities and colleges
          </p>
        </div>

        {/* Alert for Getting Started */}
        {!isReadyToGenerate && (
          <Alert className="mb-8 border-accent/50 bg-accent/5">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Get Started</AlertTitle>
            <AlertDescription>
              To generate your first timetable, you need to add departments, teachers, subjects, rooms, and sections.
              Start by clicking on the cards below to add your data.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/departments">
            <DashboardCard
              title="Departments"
              value={stats.departments}
              icon={Building2}
              description="Academic departments"
            />
          </Link>

          <Link to="/teachers">
            <DashboardCard
              title="Teachers"
              value={stats.teachers}
              icon={Users}
              description="Faculty members"
            />
          </Link>

          <Link to="/subjects">
            <DashboardCard
              title="Subjects"
              value={stats.subjects}
              icon={BookOpen}
              description="Courses and subjects"
            />
          </Link>

          <Link to="/rooms">
            <DashboardCard
              title="Rooms"
              value={stats.rooms}
              icon={DoorOpen}
              description="Classrooms and labs"
            />
          </Link>

          <Link to="/sections">
            <DashboardCard
              title="Sections"
              value={stats.sections}
              icon={UsersRound}
              description="Student sections"
            />
          </Link>

          <Link to="/generate">
            <DashboardCard
              title="Timetables"
              value={stats.timetables}
              icon={Calendar}
              description="Generated schedules"
            />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Setup Your Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add all necessary information before generating timetables
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/departments">Add Departments</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/teachers">Add Teachers</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/subjects">Add Subjects</Link>
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground border border-primary">
              <h3 className="font-semibold mb-2">Generate Timetable</h3>
              <p className="text-sm opacity-90 mb-4">
                Create optimized schedules with our intelligent algorithm
              </p>
              <Button 
                size="sm" 
                variant="secondary"
                disabled={!isReadyToGenerate}
                asChild={isReadyToGenerate}
              >
                {isReadyToGenerate ? (
                  <Link to="/generate">Start Generation</Link>
                ) : (
                  <span>Complete Setup First</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border/50 shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Automated Scheduling</h3>
            <p className="text-sm text-muted-foreground">
              Generate conflict-free timetables automatically with intelligent constraint satisfaction
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border/50 shadow-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Conflict Detection</h3>
            <p className="text-sm text-muted-foreground">
              Identify and resolve scheduling conflicts with detailed constraint validation
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border/50 shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Optimized Results</h3>
            <p className="text-sm text-muted-foreground">
              Maximize resource utilization while respecting all hard and soft constraints
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
