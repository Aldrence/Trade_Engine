import { Sidebar } from "@/components/Sidebar";
import { useTradeLogs, useClearLogs } from "@/hooks/use-logs";
import { format } from "date-fns";
import { Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Logs() {
  const { data: logs, isLoading } = useTradeLogs();
  const clearMutation = useClearLogs();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">Trade Logs</h1>
            <p className="text-muted-foreground">Historical record of all bot actions</p>
          </div>
          <Button 
            variant="outline" 
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm("Are you sure you want to clear ALL logs? This cannot be undone.")) {
                clearMutation.mutate();
              }
            }}
            disabled={!logs?.length || clearMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Logs
          </Button>
        </header>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-white/5 border-border/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell className="font-bold">{log.symbol}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        log.action === 'BUY' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">${log.amount}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-bold text-sm",
                        log.result === 'WIN' ? "text-green-400" : log.result === 'LOSS' ? "text-red-400" : "text-yellow-400"
                      )}>
                        {log.result || 'PENDING'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {log.screenshotUrl && (
                        <a 
                          href={log.screenshotUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ImageIcon className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    No trades recorded yet. Start your bot to see activity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
