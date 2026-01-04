import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateStrategyRequest, type UpdateStrategyRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useStrategies() {
  return useQuery({
    queryKey: [api.strategies.list.path],
    queryFn: async () => {
      const res = await fetch(api.strategies.list.path);
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return api.strategies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateStrategyRequest) => {
      const res = await fetch(api.strategies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create strategy");
      return api.strategies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
      toast({ title: "Success", description: "Strategy created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateStrategyRequest) => {
      const url = buildUrl(api.strategies.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update strategy");
      return api.strategies.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
      toast({ title: "Success", description: "Strategy updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.strategies.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete strategy");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
      toast({ title: "Success", description: "Strategy deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.strategies.toggle.path, { id });
      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle strategy");
      return api.strategies.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
      toast({ 
        title: data.active ? "Strategy Activated" : "Strategy Deactivated",
        description: `Strategy "${data.name}" is now ${data.active ? "active" : "inactive"}`
      });
    },
  });
}
