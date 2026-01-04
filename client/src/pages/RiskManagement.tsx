import { Sidebar } from "@/components/Sidebar";
import { useRiskSettings, useUpdateRiskSettings } from "@/hooks/use-risk";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRiskSettingsSchema, type InsertRiskSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, DollarSign, TrendingDown, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RiskManagement() {
  const { data: riskSettings, isLoading } = useRiskSettings();
  const updateMutation = useUpdateRiskSettings();

  const form = useForm<InsertRiskSettings>({
    resolver: zodResolver(insertRiskSettingsSchema),
    defaultValues: {
      maxDailyLoss: 100,
      tradeSize: 10,
      dailyStopLoss: 50,
      takeProfit: 200,
      martingaleMultiplier: "1.0",
      active: true,
    }
  });

  // Load data into form when fetched
  useEffect(() => {
    if (riskSettings) {
      form.reset(riskSettings);
    }
  }, [riskSettings, form]);

  const onSubmit = (data: InsertRiskSettings) => {
    // Ensure numbers are numbers (form inputs might return strings)
    const formattedData = {
      ...data,
      maxDailyLoss: Number(data.maxDailyLoss),
      tradeSize: Number(data.tradeSize),
      dailyStopLoss: Number(data.dailyStopLoss),
      takeProfit: Number(data.takeProfit),
    };
    updateMutation.mutate(formattedData);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-display">Risk Management</h1>
          <p className="text-muted-foreground">Global safety protocols and position sizing</p>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Safety Card */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle>Safety Limits</CardTitle>
                    <CardDescription>Hard stops to protect capital</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Max Daily Loss ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...form.register("maxDailyLoss")} 
                      className="pl-9 bg-secondary/30"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Bot stops trading if loss exceeds this amount.</p>
                </div>

                <div className="space-y-2">
                  <Label>Daily Stop Loss ($)</Label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...form.register("dailyStopLoss")} 
                      className="pl-9 bg-secondary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Sizing Card */}
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Position Sizing</CardTitle>
                    <CardDescription>Stake amounts and multipliers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Base Trade Size ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...form.register("tradeSize")} 
                      className="pl-9 bg-secondary/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Martingale Multiplier</Label>
                  <Input 
                    {...form.register("martingaleMultiplier")} 
                    placeholder="1.0" 
                    className="bg-secondary/30"
                  />
                  <p className="text-xs text-muted-foreground">Multiplies stake after a loss (e.g. 2.0 = double down).</p>
                </div>

                <div className="space-y-2">
                  <Label>Take Profit Target ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...form.register("takeProfit")} 
                      className="pl-9 bg-secondary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 min-w-[200px]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : "Save Risk Settings"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
