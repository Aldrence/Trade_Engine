import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { useTradeLogs } from "@/hooks/use-logs";
import { useRiskSettings } from "@/hooks/use-risk";
import { Activity, TrendingUp, AlertTriangle, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from "date-fns";

export default function Dashboard() {
  const { data: logs, isLoading: logsLoading } = useTradeLogs();
  const { data: risk } = useRiskSettings();

  const totalTrades = logs?.length || 0;
  const wins = logs?.filter(l => l.result === 'WIN').length || 0;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  
  // Calculate PnL (Mock calculation based on amount for demo)
  const pnl = logs?.reduce((acc, log) => {
    if (log.result === 'WIN') return acc + (log.amount * 0.8); // 80% payout
    if (log.result === 'LOSS') return acc - log.amount;
    return acc;
  }, 0) || 0;

  // Prepare chart data (last 7 trades)
  const chartData = logs?.slice(-10).map((log, i) => ({
    name: i + 1,
    amount: log.result === 'WIN' ? log.amount * 0.8 : -log.amount,
    result: log.result
  })) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Command Center</h1>
          <p className="text-muted-foreground">Live overview of your trading bot activity</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Trades" 
            value={totalTrades} 
            icon={<Activity className="w-6 h-6" />}
            trend="+12% today"
            trendUp={true}
          />
          <StatCard 
            title="Win Rate" 
            value={`${winRate}%`} 
            icon={<TrendingUp className="w-6 h-6" />}
            trend={winRate > 50 ? "Profitable" : "Check Strategy"}
            trendUp={winRate > 50}
          />
          <StatCard 
            title="Net PnL" 
            value={`$${pnl.toFixed(2)}`} 
            icon={<Wallet className="w-6 h-6" />}
            trend={pnl >= 0 ? "In Profit" : "In Loss"}
            trendUp={pnl >= 0}
          />
          <StatCard 
            title="Risk Usage" 
            value={`${risk?.tradeSize || 10}$ / trade`}
            icon={<AlertTriangle className="w-6 h-6" />}
            className="border-yellow-500/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Performance
            </h3>
            <div className="h-[300px] w-full">
              {logsLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
                  Loading chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.result === 'WIN' ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Logs Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Feed
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {logsLoading ? (
                <div className="text-sm text-muted-foreground text-center py-10">Syncing logs...</div>
              ) : logs && logs.length > 0 ? (
                logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{log.symbol}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          log.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), 'HH:mm:ss') : '-'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        log.result === 'WIN' ? 'text-green-400' : log.result === 'LOSS' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {log.result || 'PENDING'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">${log.amount}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-10">No trades yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
