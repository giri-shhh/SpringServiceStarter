import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import CreateServiceModal from "@/components/CreateServiceModal";

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
              Microservices Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Overview of your Spring Boot microservice architecture
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Microservice
          </Button>
        </div>
        
        <Dashboard />
      </div>
      
      <CreateServiceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}