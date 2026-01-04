import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Strategies from "@/pages/Strategies";
import RiskManagement from "@/pages/RiskManagement";
import Logs from "@/pages/Logs";
import Setup from "@/pages/Setup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/strategies" component={Strategies} />
      <Route path="/risk" component={RiskManagement} />
      <Route path="/logs" component={Logs} />
      <Route path="/setup" component={Setup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
