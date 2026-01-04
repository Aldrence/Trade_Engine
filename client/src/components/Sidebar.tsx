import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LineChart, 
  ShieldCheck, 
  ScrollText, 
  Download,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/strategies", label: "Strategies", icon: LineChart },
  { href: "/risk", label: "Risk Management", icon: ShieldCheck },
  { href: "/logs", label: "Trade Logs", icon: ScrollText },
  { href: "/setup", label: "Setup & Download", icon: Download },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen w-64 bg-card border-r border-border fixed left-0 top-0 flex flex-col z-10">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-display text-primary glow-text">
            AUTOTRADE
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          v2.4.0 • CONNECTED
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-secondary to-card border border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">System Online</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Monitoring local instance...
        </p>
      </div>
    </div>
  );
}
