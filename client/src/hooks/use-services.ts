import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";

export function useServices() {
  // Fetch all services
  const { data: services = [], isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Create a new service
  const createService = useMutation({
    mutationFn: async (serviceData: Omit<Service, 'id'>) => {
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
  });

  // Update a service
  const updateService = useMutation({
    mutationFn: async ({ id, ...serviceData }: { id: number, [key: string]: any }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
  });

  // Delete a service
  const deleteService = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
  });

  return {
    services,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
  };
}
