import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UpdateRiskSettingsRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useRiskSettings() {
  return useQuery({
    queryKey: [api.riskSettings.get.path],
    queryFn: async () => {
      const res = await fetch(api.riskSettings.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch risk settings");
      return api.riskSettings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateRiskSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateRiskSettingsRequest) => {
      const res = await fetch(api.riskSettings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update risk settings");
      return api.riskSettings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.riskSettings.get.path] });
      toast({ title: "Success", description: "Risk settings saved successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
