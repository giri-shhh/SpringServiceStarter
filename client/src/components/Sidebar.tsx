import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CircleDotDashed, Code, Download, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Service } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SidebarProps {
  services: Service[];
  activeServiceId: number | null;
  onSelectService: (serviceId: number) => void;
  onCreateService: () => void;
}

export default function Sidebar({ 
  services, 
  activeServiceId, 
  onSelectService, 
  onCreateService 
}: SidebarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  // Listen for mobile menu toggle events
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsVisible(!isVisible);
    };

    window.addEventListener("toggle-sidebar", handleToggleSidebar);
    
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggleSidebar);
    };
  }, [isVisible]);

  // For small screens, automatically hide the sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    
    // Call once on mount
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle service deletion
  const handleDeleteService = async (serviceId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the service selection
    
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await apiRequest("DELETE", `/api/services/${serviceId}`);
        
        // Invalidate services cache to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/services'] });
        
        toast({
          title: "Service deleted",
          description: "The microservice has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the service. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Get service language and build system short representation
  const getServiceTechStack = (service: Service) => {
    return `${service.language}, ${service.buildSystem === 'maven' ? 'Maven' : 
      service.buildSystem === 'gradle-groovy' ? 'Gradle' : 'Gradle Kotlin'}, ${service.springBootVersion}`;
  };

  // Generate all services
  const handleGenerateAll = async () => {
    if (services.length === 0) {
      toast({
        title: "No services to generate",
        description: "Please create at least one microservice first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/generate-all", {});
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(new Blob([await response.arrayBuffer()]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'microservices.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Project generated",
        description: "All microservices have been successfully generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate the project. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4 transition-all">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <CircleDotDashed className="mr-2 text-green-600" />
        Microservices
      </h2>
      
      <div className="space-y-3 mb-6">
        {services.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500">
            No services created yet
          </div>
        ) : (
          services.map((service) => (
            <div 
              key={service.id}
              className={`service-item bg-gray-50 rounded-lg p-3 cursor-pointer ${
                activeServiceId === service.id ? 'border-l-4 border-green-600' : ''
              }`}
              onClick={() => onSelectService(service.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{service.name}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality would be implemented here
                      // For now, just select the service
                      onSelectService(service.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:text-red-500"
                    onClick={(e) => handleDeleteService(service.id, e)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getServiceTechStack(service)}
              </div>
              <div className="text-xs mt-2 flex flex-wrap gap-1">
                {service.dependencies.slice(0, 3).map((dep, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {dep}
                  </Badge>
                ))}
                {service.dependencies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{service.dependencies.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center"
        onClick={onCreateService}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> 
        Add New Service
      </Button>
      
      <div className="mt-6 border-t pt-4">
        <h3 className="text-md font-semibold mb-3">Project Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
          >
            <CircleDotDashed className="mr-2 h-4 w-4" /> 
            Visualize Architecture
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleGenerateAll}
          >
            <Code className="mr-2 h-4 w-4" /> 
            Generate All Services
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleGenerateAll}
          >
            <Download className="mr-2 h-4 w-4" /> 
            Download All
          </Button>
        </div>
      </div>
    </aside>
  );
}
