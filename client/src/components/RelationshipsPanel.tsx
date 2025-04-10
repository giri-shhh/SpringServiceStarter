import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Plus, Trash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Service, type Relationship } from "@shared/schema";
import { useServices } from "@/hooks/use-services";

interface RelationshipsPanelProps {
  serviceData: Service;
}

export default function RelationshipsPanel({ serviceData }: RelationshipsPanelProps) {
  const { toast } = useToast();
  const { services } = useServices();
  const [relationships, setRelationships] = useState<Relationship[]>(serviceData.relationships || []);
  const [architectureConstraints, setArchitectureConstraints] = useState({
    enforceDiscovery: false,
    enableCircuitBreaker: false,
    enforceGateway: false
  });

  // Filter out the current service from available services
  const otherServices = services.filter(service => service.id !== serviceData.id);

  // Add a new relationship
  const addRelationship = () => {
    // Only add if there are other services available
    if (otherServices.length > 0) {
      const newRelationship: Relationship = {
        sourceServiceId: serviceData.id,
        targetServiceId: otherServices[0].id,
        communicationType: "REST"
      };
      
      setRelationships([...relationships, newRelationship]);
    } else {
      toast({
        title: "Cannot add relationship",
        description: "You need to create at least one more service to establish a relationship.",
        variant: "destructive"
      });
    }
  };

  // Remove a relationship
  const removeRelationship = (index: number) => {
    const updatedRelationships = [...relationships];
    updatedRelationships.splice(index, 1);
    setRelationships(updatedRelationships);
  };

  // Update relationship communication type
  const updateCommunicationType = (index: number, type: string) => {
    const updatedRelationships = [...relationships];
    updatedRelationships[index].communicationType = type;
    setRelationships(updatedRelationships);
  };

  // Update relationship target service
  const updateTargetService = (index: number, targetServiceId: number) => {
    const updatedRelationships = [...relationships];
    updatedRelationships[index].targetServiceId = targetServiceId;
    setRelationships(updatedRelationships);
  };

  // Get service name by ID
  const getServiceName = (serviceId: number): string => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  // Save relationships to the service
  const saveRelationships = async () => {
    try {
      await apiRequest("PUT", `/api/services/${serviceData.id}/relationships`, {
        relationships
      });
      
      // Invalidate the services cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Relationships updated",
        description: "Service relationships have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the relationships. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate the service
  const generateService = async () => {
    try {
      const response = await apiRequest("POST", `/api/generate/${serviceData.id}`, {});
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(new Blob([await response.arrayBuffer()]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${serviceData.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Service generated",
        description: "The microservice has been successfully generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate the service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <h3 className="text-md font-semibold mb-4">Service Relationships</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        {relationships.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <p>No relationships defined yet. Click "Add Relationship" to connect this service with other microservices.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {relationships.map((relationship, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm min-w-40 text-center">
                  <div className="text-lg font-medium mb-2">{serviceData.name}</div>
                  <div className="text-xs text-gray-500 mb-3">
                    {serviceData.language}, {serviceData.buildSystem === 'maven' ? 'Maven' : 'Gradle'}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full relative">
                      <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full border-2 border-dashed border-gray-300"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="py-2 px-3 bg-white rounded shadow-sm mb-2">
                    <Select
                      value={relationship.communicationType}
                      onValueChange={(value) => updateCommunicationType(index, value)}
                    >
                      <SelectTrigger className="border-none text-sm w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REST">REST API</SelectItem>
                        <SelectItem value="Message">Message Queue</SelectItem>
                        <SelectItem value="gRPC">gRPC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 h-0.5 bg-gray-300 relative flex items-center">
                    <ArrowRight className="absolute -right-1 -top-2 text-gray-400 h-4 w-4" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -bottom-4 left-6 text-red-500 h-7 w-7 bg-white rounded-full shadow-sm"
                      onClick={() => removeRelationship(index)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm min-w-40 text-center">
                  <Select
                    value={relationship.targetServiceId.toString()}
                    onValueChange={(value) => updateTargetService(index, parseInt(value))}
                  >
                    <SelectTrigger className="border-none text-lg font-medium mb-2 justify-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {otherServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 mb-3">
                    {(() => {
                      const targetService = services.find(s => s.id === relationship.targetServiceId);
                      return targetService 
                        ? `${targetService.language}, ${targetService.buildSystem === 'maven' ? 'Maven' : 'Gradle'}`
                        : '';
                    })()}
                  </div>
                  <div className="flex justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full relative">
                      <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full border-2 border-dashed border-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={addRelationship}
            disabled={otherServices.length === 0}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Relationship
          </Button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Architecture Constraints</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="enforce-discovery" 
              checked={architectureConstraints.enforceDiscovery}
              onCheckedChange={(checked) => 
                setArchitectureConstraints({ ...architectureConstraints, enforceDiscovery: checked === true })
              }
            />
            <Label htmlFor="enforce-discovery" className="text-sm">Enforce service discovery for all microservices</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="enable-circuit-breaker" 
              checked={architectureConstraints.enableCircuitBreaker}
              onCheckedChange={(checked) => 
                setArchitectureConstraints({ ...architectureConstraints, enableCircuitBreaker: checked === true })
              }
            />
            <Label htmlFor="enable-circuit-breaker" className="text-sm">Enable circuit breaker pattern</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="enforce-gateway" 
              checked={architectureConstraints.enforceGateway}
              onCheckedChange={(checked) => 
                setArchitectureConstraints({ ...architectureConstraints, enforceGateway: checked === true })
              }
            />
            <Label htmlFor="enforce-gateway" className="text-sm">Enforce API Gateway pattern</Label>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 flex justify-end">
        <Button
          variant="outline"
          className="mr-2"
        >
          Back
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            saveRelationships();
            generateService();
          }}
        >
          Generate Service
        </Button>
      </div>
    </div>
  );
}
