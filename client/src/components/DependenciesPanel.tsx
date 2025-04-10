import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Service } from "@shared/schema";
import { allDependencies, type DependencyGroup } from "@/lib/dependenciesList";

interface DependenciesPanelProps {
  serviceData: Service;
}

export default function DependenciesPanel({ serviceData }: DependenciesPanelProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(serviceData.dependencies);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [filteredDependencies, setFilteredDependencies] = useState<DependencyGroup[]>(allDependencies);

  // Filter dependencies based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredDependencies(allDependencies);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = allDependencies
      .map(group => ({
        ...group,
        dependencies: group.dependencies.filter(dep => 
          dep.name.toLowerCase().includes(searchTermLower) || 
          dep.description.toLowerCase().includes(searchTermLower)
        )
      }))
      .filter(group => group.dependencies.length > 0);

    setFilteredDependencies(filtered);
    
    // Auto-expand all groups that have matching dependencies
    setExpandedGroups(filtered.map(group => group.name));
  }, [searchTerm]);

  // Toggle group expansion
  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  // Add dependency to selected list
  const addDependency = (dependency: string) => {
    if (!selectedDependencies.includes(dependency)) {
      setSelectedDependencies([...selectedDependencies, dependency]);
    }
  };

  // Remove dependency from selected list
  const removeDependency = (dependency: string) => {
    setSelectedDependencies(selectedDependencies.filter(dep => dep !== dependency));
  };

  // Save dependencies to the service
  const saveDependencies = async () => {
    try {
      await apiRequest("PUT", `/api/services/${serviceData.id}/dependencies`, {
        dependencies: selectedDependencies
      });
      
      // Invalidate the services cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Dependencies updated",
        description: "The service dependencies have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the dependencies. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get dependency details from its ID
  const getDependencyDetails = (id: string) => {
    for (const group of allDependencies) {
      const dependency = group.dependencies.find(dep => dep.id === id);
      if (dependency) {
        return dependency;
      }
    }
    return { id, name: id, description: "" }; // Fallback if not found
  };

  // Handle drag and drop
  const onDragStart = (e: React.DragEvent, dependencyId: string) => {
    e.dataTransfer.setData("dependencyId", dependencyId);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dependencyId = e.dataTransfer.getData("dependencyId");
    addDependency(dependencyId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search dependencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <h3 className="text-md font-semibold mb-4">Available Dependencies</h3>
          
          {filteredDependencies.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              No dependencies found matching "{searchTerm}"
            </div>
          ) : (
            filteredDependencies.map((group) => (
              <div key={group.name} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{group.name}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 hover:text-green-600"
                    onClick={() => toggleGroupExpansion(group.name)}
                  >
                    {expandedGroups.includes(group.name) ? "Collapse" : "Expand"}
                  </Button>
                </div>
                
                {expandedGroups.includes(group.name) && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {group.dependencies.map((dependency) => (
                      <div 
                        key={dependency.id}
                        className="dependency-item flex justify-between items-center p-2 bg-white rounded border border-gray-200 cursor-grab hover:border-green-600"
                        draggable
                        onDragStart={(e) => onDragStart(e, dependency.id)}
                      >
                        <div>
                          <div className="font-medium">{dependency.name}</div>
                          <div className="text-xs text-gray-500">{dependency.description}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-green-600"
                          onClick={() => addDependency(dependency.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div>
          <h3 className="text-md font-semibold mb-4">Selected Dependencies</h3>
          <div 
            className="min-h-60 bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {selectedDependencies.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="transform rotate-180 mb-2">↓</div>
                <p>Drag dependencies here or click + button</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDependencies.map((depId) => {
                  const dependency = getDependencyDetails(depId);
                  return (
                    <div 
                      key={depId}
                      className="selected-dependency flex justify-between items-center p-2 bg-white rounded border border-green-600"
                    >
                      <div className="font-medium">{dependency.name}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-600"
                        onClick={() => removeDependency(depId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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
              onClick={saveDependencies}
            >
              Continue to Relationships
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
