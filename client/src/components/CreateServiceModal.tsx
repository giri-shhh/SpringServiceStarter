import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  defaultDependencies: z.array(z.string()),
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      serviceType: "resource",
      defaultDependencies: ["web", "actuator"],
    },
  });

  // Watch dependencies for checkbox management
  const selectedDependencies = watch("defaultDependencies");

  // Helper function to handle checkbox toggling
  const toggleDependency = (dependency: string, checked: boolean) => {
    const currentDeps = [...selectedDependencies];
    
    if (checked) {
      // Add dependency if not already present
      if (!currentDeps.includes(dependency)) {
        currentDeps.push(dependency);
      }
    } else {
      // Remove dependency if present
      const index = currentDeps.indexOf(dependency);
      if (index !== -1) {
        currentDeps.splice(index, 1);
      }
    }
    
    setValue("defaultDependencies", currentDeps);
  };

  const onSubmit = async (data: CreateServiceFormData) => {
    try {
      // Create basic service with default settings and selected dependencies
      await apiRequest("POST", "/api/services", {
        name: data.name,
        buildSystem: "maven", // default values
        language: "java",
        springBootVersion: "3.4.4",
        group: "com.example",
        artifact: data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: `${data.name} for Spring Boot microservice`,
        packageName: `com.example.${data.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        packaging: "jar",
        javaVersion: "17",
        dependencies: data.defaultDependencies,
        relationships: [],
      });
      
      // Update the service list
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      // Show success toast
      toast({
        title: "Service created",
        description: `The ${data.name} microservice has been successfully created.`,
      });
      
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Microservice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700 mb-1">
              Service Name
            </Label>
            <Input
              id="serviceName"
              placeholder="e.g. user-service"
              {...register("name")}
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700 mb-1">
              Service Type
            </Label>
            <Select
              defaultValue="resource"
              onValueChange={(value) => setValue("serviceType", value)}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resource">Resource Service</SelectItem>
                <SelectItem value="gateway">API Gateway</SelectItem>
                <SelectItem value="configuration">Configuration Server</SelectItem>
                <SelectItem value="discovery">Discovery Server</SelectItem>
                <SelectItem value="authentication">Authentication Server</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1">
              Default Dependencies
            </Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="dep-web" 
                  checked={selectedDependencies.includes("web")}
                  onCheckedChange={(checked) => toggleDependency("web", checked === true)}
                />
                <Label htmlFor="dep-web" className="text-sm">Spring Web</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="dep-actuator" 
                  checked={selectedDependencies.includes("actuator")}
                  onCheckedChange={(checked) => toggleDependency("actuator", checked === true)}
                />
                <Label htmlFor="dep-actuator" className="text-sm">Spring Actuator</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="dep-eureka" 
                  checked={selectedDependencies.includes("eureka")}
                  onCheckedChange={(checked) => toggleDependency("eureka", checked === true)}
                />
                <Label htmlFor="dep-eureka" className="text-sm">Eureka Discovery Client</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="dep-config" 
                  checked={selectedDependencies.includes("config")}
                  onCheckedChange={(checked) => toggleDependency("config", checked === true)}
                />
                <Label htmlFor="dep-config" className="text-sm">Config Client</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
