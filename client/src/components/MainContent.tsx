import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigurationForm from "@/components/ConfigurationForm";
import DependenciesPanel from "@/components/DependenciesPanel";
import RelationshipsPanel from "@/components/RelationshipsPanel";
import { type Service } from "@shared/schema";

interface MainContentProps {
  activeService: Service | null;
}

export default function MainContent({ activeService }: MainContentProps) {
  const [activeTab, setActiveTab] = useState("configure");

  // If no service is selected, show welcome screen or empty state
  if (!activeService) {
    return (
      <main className="flex-1 bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center">
        <img 
          src="https://spring.io/img/logos/spring-initializr.svg" 
          alt="Spring logo" 
          className="h-16 mb-6 opacity-40"
        />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Microservice Architect</h2>
        <p className="text-gray-600 mb-6 max-w-lg">
          Create and configure your Spring Boot microservices effortlessly. 
          Start by adding a new service from the sidebar.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 border-b w-full justify-start rounded-none bg-transparent h-auto p-0 space-x-6">
          <TabsTrigger 
            value="configure" 
            className="text-base pb-3 px-1 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none bg-transparent hover:text-green-600"
          >
            Configure Service
          </TabsTrigger>
          <TabsTrigger 
            value="dependencies" 
            className="text-base pb-3 px-1 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none bg-transparent hover:text-green-600"
          >
            Dependencies
          </TabsTrigger>
          <TabsTrigger 
            value="relationships" 
            className="text-base pb-3 px-1 data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none bg-transparent hover:text-green-600"
          >
            Relationships
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure">
          <ConfigurationForm serviceData={activeService} />
        </TabsContent>
        
        <TabsContent value="dependencies">
          <DependenciesPanel serviceData={activeService} />
        </TabsContent>
        
        <TabsContent value="relationships">
          <RelationshipsPanel serviceData={activeService} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
