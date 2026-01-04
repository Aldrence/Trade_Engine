import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-2xl bg-card border border-border shadow-lg relative overflow-hidden group hover:border-primary/30 transition-colors duration-300",
      className
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
        {icon}
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
          {title}
        </h3>
        <div className="text-primary/80">
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-display text-foreground tracking-tight">
          {value}
        </span>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trendUp 
              ? "text-green-400 bg-green-400/10" 
              : "text-red-400 bg-red-400/10"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
