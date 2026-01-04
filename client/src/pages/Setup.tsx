import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@shared/routes";

export default function Setup() {
  const handleDownload = () => {
    // Direct link trigger for file download
    window.location.href = api.bot.download.path;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-display">Setup & Download</h1>
          <p className="text-muted-foreground">Get your bot running locally</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Installation Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Download Configured Bot</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This script comes pre-loaded with your API endpoints and current strategy settings.
                    </p>
                    <Button onClick={handleDownload} className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                      <Download className="w-4 h-4" /> Download bot.py
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Install Dependencies</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      You need Python installed. Run this command in your terminal:
                    </p>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/10 font-mono text-sm text-green-400">
                      pip install requests pyautogui pillow
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Run the Bot</h3>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/10 font-mono text-sm text-green-400">
                      python bot.py
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-500 mb-1">Important Note</h4>
                <p className="text-sm text-yellow-500/80">
                  Keep this dashboard open while the bot runs. The bot will send screenshots and logs here in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Python 3.8 or higher",
                    "Windows, macOS, or Linux",
                    "Active Internet Connection",
                    "Broker/Trading Platform open on screen"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
             </Card>

             <Card className="bg-gradient-to-br from-primary/20 to-card border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-primary">Status Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <span className="text-sm font-bold text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Webhook Endpoint</span>
                    <span className="text-sm font-bold text-foreground font-mono">/api/logs</span>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
