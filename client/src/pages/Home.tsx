import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import CreateServiceModal from "@/components/CreateServiceModal";
import { useServices } from "@/hooks/use-services";

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
  const { services } = useServices();

  const handleCreateService = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleSelectService = (serviceId: number) => {
    setActiveServiceId(serviceId);
  };

  // Get the currently active service if one is selected
  const activeService = activeServiceId !== null 
    ? services.find(service => service.id === activeServiceId) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 flex-1">
        <Sidebar 
          services={services}
          activeServiceId={activeServiceId}
          onSelectService={handleSelectService}
          onCreateService={handleCreateService}
        />
        
        <MainContent 
          activeService={activeService}
        />
      </div>

      <CreateServiceModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal}
      />
    </div>
  );
}
