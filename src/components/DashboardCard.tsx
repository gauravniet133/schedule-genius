import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  action?: ReactNode;
}

export const DashboardCard = ({ 
  title, 
  description, 
  value, 
  icon: Icon,
  trend,
  action 
}: DashboardCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`text-xs mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
};
