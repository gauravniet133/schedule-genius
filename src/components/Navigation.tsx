import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BookOpen, 
  DoorOpen, 
  UsersRound,
  Calendar,
  Settings,
  CalendarClock,
  BarChart3,
  GraduationCap,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const adminNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/departments", label: "Departments", icon: Building2 },
  { to: "/teachers", label: "Teachers", icon: Users },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/rooms", label: "Rooms", icon: DoorOpen },
  { to: "/sections", label: "Sections", icon: UsersRound },
  { to: "/availability", label: "Availability", icon: CalendarClock },
  { to: "/preferences", label: "Preferences", icon: Settings },
  { to: "/generate", label: "Generate", icon: Calendar },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
];

const studentNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student", label: "My Schedule", icon: GraduationCap },
];

export const Navigation = () => {
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SmartSchedule</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:inline max-w-[150px] truncate">
                {user?.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
