import Header from "@/components/Header";
import ArchitectureVisualization from "@/components/ArchitectureVisualization";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">Microservice Architecture Visualization</h1>
          </div>
        </div>

        <div className="mt-4">
          <ArchitectureVisualization />
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-3">Legend</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span>REST API Connections</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Message Queue Connections</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
              <span>gRPC Connections</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Tip:</strong> You can zoom, pan, and rearrange nodes in the diagram. Use the layout options to automatically reorganize the services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}