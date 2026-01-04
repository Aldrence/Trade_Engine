import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useStrategies, useCreateStrategy, useUpdateStrategy, useDeleteStrategy, useToggleStrategy } from "@/hooks/use-strategies";
import { Plus, Edit2, Trash2, Power, Code, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStrategySchema, type InsertStrategy } from "@shared/schema";
import { cn } from "@/lib/utils";

// --- Strategy Form Component ---
function StrategyForm({ 
  defaultValues, 
  onSuccess, 
  trigger 
}: { 
  defaultValues?: Partial<InsertStrategy>, 
  onSuccess: () => void,
  trigger: React.ReactNode 
}) {
  const [open, setOpen] = useState(false);
  const isEditing = !!defaultValues;
  const createMutation = useCreateStrategy();
  const updateMutation = useUpdateStrategy();

  const form = useForm<InsertStrategy>({
    resolver: zodResolver(insertStrategySchema),
    defaultValues: {
      name: "",
      description: "",
      config: JSON.stringify({ rsi_period: 14, overbought: 70, oversold: 30 }, null, 2),
      active: false,
      ...defaultValues,
      // Ensure config is stringified if coming from DB as object
      config: typeof defaultValues?.config === 'object' 
        ? JSON.stringify(defaultValues.config, null, 2) 
        : (defaultValues?.config as unknown as string) || JSON.stringify({ rsi_period: 14, overbought: 70, oversold: 30 }, null, 2)
    }
  });

  const onSubmit = async (data: InsertStrategy) => {
    try {
      // Validate JSON
      try {
        const parsedConfig = JSON.parse(data.config as unknown as string);
        data.config = parsedConfig;
      } catch (e) {
        form.setError("config", { message: "Invalid JSON format" });
        return;
      }

      if (isEditing && defaultValues?.id) {
        await updateMutation.mutateAsync({ id: defaultValues.id as number, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
      onSuccess();
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{isEditing ? "Edit Strategy" : "New Strategy"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Strategy Name</Label>
            <Input {...form.register("name")} placeholder="e.g., RSI Reversal" className="bg-secondary/50" />
            {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...form.register("description")} placeholder="Short description..." className="bg-secondary/50" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Configuration (JSON)</Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Code className="w-3 h-3" />
                <span>JSON Editor</span>
              </div>
            </div>
            <Textarea 
              {...form.register("config")} 
              className="font-mono text-xs h-48 bg-black/40 border-primary/20 focus:border-primary"
              placeholder='{ "rsi_period": 14, "overbought": 70 }'
            />
            {form.formState.errors.config && <p className="text-red-400 text-xs">{form.formState.errors.config.message}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-xs text-muted-foreground">Enable this strategy immediately</p>
            </div>
            <Switch 
              checked={form.watch("active") || false}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              {isEditing ? "Save Changes" : "Create Strategy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---
export default function Strategies() {
  const { data: strategies, isLoading } = useStrategies();
  const deleteMutation = useDeleteStrategy();
  const toggleMutation = useToggleStrategy();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display">Strategies</h1>
            <p className="text-muted-foreground">Manage your automation logic</p>
          </div>
          <StrategyForm 
            onSuccess={() => {}} 
            trigger={
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> New Strategy
              </Button>
            } 
          />
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-card/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies?.map((strategy) => (
              <div 
                key={strategy.id} 
                className={cn(
                  "group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl",
                  strategy.active 
                    ? "bg-card border-primary/40 shadow-lg shadow-primary/5" 
                    : "bg-card/50 border-border opacity-80 hover:opacity-100"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <StrategyForm 
                      defaultValues={strategy}
                      onSuccess={() => {}}
                      trigger={
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-secondary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this strategy?")) {
                          deleteMutation.mutate(strategy.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold font-display mb-1">{strategy.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                  {strategy.description || "No description provided."}
                </p>

                <div className="bg-black/30 rounded-lg p-3 font-mono text-[10px] text-muted-foreground mb-6 h-20 overflow-hidden relative">
                  <pre>{JSON.stringify(strategy.config, null, 2)}</pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                    strategy.active ? "text-green-400" : "text-muted-foreground"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", strategy.active ? "bg-green-400 animate-pulse" : "bg-muted-foreground")} />
                    {strategy.active ? "Running" : "Inactive"}
                  </span>
                  
                  <Button 
                    size="sm" 
                    variant={strategy.active ? "secondary" : "outline"}
                    className={cn(
                      "gap-2 transition-all",
                      strategy.active && "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                    )}
                    onClick={() => toggleMutation.mutate(strategy.id)}
                    disabled={toggleMutation.isPending}
                  >
                    <Power className="w-3 h-3" />
                    {strategy.active ? "Stop" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Add New Card (Empty State) */}
            <StrategyForm 
              onSuccess={() => {}}
              trigger={
                <button className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-border bg-transparent hover:bg-card/30 hover:border-primary/50 transition-all group h-full min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-muted-foreground group-hover:text-foreground">Create New Strategy</h3>
                  <p className="text-sm text-muted-foreground/60 mt-1">Configure logic & indicators</p>
                </button>
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
