
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, ArrowRight, Cloud, GitBranchPlus } from "lucide-react";
import { navigate } from "wouter/use-browser-location";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text mb-4">
            Spring Boot Microservices Architect
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Design, generate, and manage your Spring Boot microservices architecture with ease.
            Create production-ready services with best practices built-in.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
          >
            Get Started...
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <FileCode className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Code Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate Spring Boot services with your preferred build system, Java version, and dependencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Cloud className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Service Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built-in support for service discovery patterns using Spring Cloud and Eureka.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitBranchPlus className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Architecture Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Visualize your microservices architecture and relationships in an interactive diagram.
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

          {/* Additional Feature Cards */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Easily integrate external APIs to enhance your microservices and their functionalities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automate your deployments using CI/CD pipelines for seamless updates and rollbacks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your services and manage logs effectively to ensure high availability.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div >
  );
}
