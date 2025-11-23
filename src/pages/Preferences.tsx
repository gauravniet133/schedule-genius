import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Trash2, Save } from "lucide-react";
import { storage } from "@/lib/storage";
import { SchedulingPreferences, BreakTime } from "@/types/constraints";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const Preferences = () => {
  const [preferences, setPreferences] = useState<SchedulingPreferences>(storage.getPreferences());
  const [breaks, setBreaks] = useState<BreakTime[]>([]);
  const [newBreak, setNewBreak] = useState({
    name: "",
    day: "Monday" as typeof days[number],
    startTime: "13:00",
    endTime: "14:00"
  });
  const { toast } = useToast();

  useEffect(() => {
    setBreaks(storage.getBreaks());
  }, []);

  const handleSavePreferences = () => {
    storage.savePreferences(preferences);
    toast({
      title: "Preferences saved",
      description: "Scheduling preferences have been updated.",
    });
  };

  const handleAddBreak = () => {
    if (!newBreak.name) {
      toast({
        title: "Error",
        description: "Please enter a break name",
        variant: "destructive",
      });
      return;
    }

    const breakToAdd: BreakTime = {
      id: crypto.randomUUID(),
      ...newBreak
    };

    const updated = [...breaks, breakToAdd];
    setBreaks(updated);
    storage.saveBreaks(updated);

    toast({
      title: "Break added",
      description: `${newBreak.name} has been added.`,
    });

    setNewBreak({
      name: "",
      day: "Monday",
      startTime: "13:00",
      endTime: "14:00"
    });
  };

  const handleDeleteBreak = (id: string) => {
    const updated = breaks.filter(b => b.id !== id);
    setBreaks(updated);
    storage.saveBreaks(updated);

    toast({
      title: "Break deleted",
      description: "The break has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            Scheduling Preferences
          </h1>
          <p className="text-muted-foreground">
            Configure constraints and break times for timetable generation
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scheduling Preferences */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>Set general scheduling rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="minGap">Minimum Gap Between Classes (minutes)</Label>
                <Input
                  id="minGap"
                  type="number"
                  min="0"
                  max="60"
                  value={preferences.minGapBetweenClasses}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    minGapBetweenClasses: parseInt(e.target.value) || 0
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Buffer time between consecutive classes
                </p>
              </div>

              <div>
                <Label htmlFor="maxConsecutive">Maximum Consecutive Hours</Label>
                <Input
                  id="maxConsecutive"
                  type="number"
                  min="1"
                  max="8"
                  value={preferences.maxConsecutiveHours}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    maxConsecutiveHours: parseInt(e.target.value) || 4
                  })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum hours without a break
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Lunch Break Required</Label>
                  <p className="text-xs text-muted-foreground">
                    Ensure lunch break time is kept free
                  </p>
                </div>
                <Switch
                  checked={preferences.lunchBreakRequired}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    lunchBreakRequired: checked
                  })}
                />
              </div>

              {preferences.lunchBreakRequired && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-accent">
                  <div>
                    <Label htmlFor="lunchStart">Lunch Start</Label>
                    <Input
                      id="lunchStart"
                      type="time"
                      value={preferences.lunchBreakStart}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        lunchBreakStart: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lunchEnd">Lunch End</Label>
                    <Input
                      id="lunchEnd"
                      type="time"
                      value={preferences.lunchBreakEnd}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        lunchBreakEnd: e.target.value
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Avoid Back-to-Back Same Subject</Label>
                  <p className="text-xs text-muted-foreground">
                    Prevent scheduling same subject consecutively
                  </p>
                </div>
                <Switch
                  checked={preferences.avoidBackToBackSameSubject}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    avoidBackToBackSameSubject: checked
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prefStart">Preferred Start Time</Label>
                  <Input
                    id="prefStart"
                    type="time"
                    value={preferences.preferredStartTime}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preferredStartTime: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="prefEnd">Preferred End Time</Label>
                  <Input
                    id="prefEnd"
                    type="time"
                    value={preferences.preferredEndTime}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preferredEndTime: e.target.value
                    })}
                  />
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full gap-2">
                <Save className="w-4 h-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Break Times */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Break Times</CardTitle>
              <CardDescription>Define specific break periods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="breakName">Break Name</Label>
                  <Input
                    id="breakName"
                    value={newBreak.name}
                    onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })}
                    placeholder="e.g., Morning Break"
                  />
                </div>

                <div>
                  <Label htmlFor="breakDay">Day</Label>
                  <Select
                    value={newBreak.day}
                    onValueChange={(value) => setNewBreak({ ...newBreak, day: value as typeof days[number] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="breakStart">Start Time</Label>
                    <Input
                      id="breakStart"
                      type="time"
                      value={newBreak.startTime}
                      onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="breakEnd">End Time</Label>
                    <Input
                      id="breakEnd"
                      type="time"
                      value={newBreak.endTime}
                      onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleAddBreak} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Break
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Configured Breaks</Label>
                {breaks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No breaks configured</p>
                ) : (
                  <div className="space-y-2">
                    {breaks.map((breakTime) => (
                      <Card key={breakTime.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{breakTime.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {breakTime.day} • {breakTime.startTime} - {breakTime.endTime}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBreak(breakTime.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Preferences;
