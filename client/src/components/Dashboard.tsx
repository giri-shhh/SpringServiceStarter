import { useState } from "react";
import { useServices } from "@/hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Box, 
  Code, 
  Database, 
  Download, 
  FilterX, 
  GitMerge, 
  Globe, 
  Link2, 
  Lock, 
  Share2, 
  Shell,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { Service } from "@shared/schema";

// Dependency category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Web": <Globe className="h-4 w-4" />,
  "SQL": <Database className="h-4 w-4" />,
  "NoSQL": <Database className="h-4 w-4" />,
  "Cloud": <GitMerge className="h-4 w-4" />,
  "Security": <Lock className="h-4 w-4" />,
  "Messaging": <Share2 className="h-4 w-4" />,
  "Observability": <BarChart3 className="h-4 w-4" />,
  "Testing": <FilterX className="h-4 w-4" />,
  "Developer Tools": <Code className="h-4 w-4" />,
};

// Helper function to get category by dependency ID
const getDependencyCategory = (dependencyId: string): string => {
  const categories: Record<string, string[]> = {
    "Web": ["web", "webflux", "graphql", "hateoas", "websocket"],
    "SQL": ["data-jpa", "mysql", "postgresql", "h2", "liquibase"],
    "NoSQL": ["data-mongodb", "data-redis", "data-elasticsearch", "data-cassandra"],
    "Cloud": ["eureka", "config-client", "gateway", "config-server", "eureka-server"],
    "Security": ["security", "oauth2-client", "oauth2-resource-server"],
    "Messaging": ["kafka", "amqp", "websocket"],
    "Observability": ["actuator", "prometheus", "zipkin"],
    "Testing": ["test", "testcontainers"],
  };

  for (const [category, deps] of Object.entries(categories)) {
    if (deps.includes(dependencyId)) {
      return category;
    }
  }
  
  return "Other";
};

// Service statistics calculation
const calculateServiceStatistics = (services: Service[]) => {
  if (!services || services.length === 0) {
    return {
      totalServices: 0,
      totalDependencies: 0,
      totalRelationships: 0,
      dependencyCounts: {} as Record<string, number>,
      avgDependenciesPerService: 0,
      serviceTypes: {} as Record<string, number>
    };
  }

  const totalServices = services.length;
  let totalDependencies = 0;
  let totalRelationships = 0;
  const dependencyCounts: Record<string, number> = {};
  const serviceTypes: Record<string, number> = {};

  services.forEach(service => {
    // Count dependencies
    if (service.dependencies) {
      totalDependencies += service.dependencies.length;
      
      service.dependencies.forEach(dep => {
        const category = getDependencyCategory(dep);
        dependencyCounts[category] = (dependencyCounts[category] || 0) + 1;
      });
    }

    // Count relationships
    if (service.relationships) {
      totalRelationships += service.relationships.length;
    }

    // Count service types based on dependencies
    let serviceType = "Basic Service";
    if (service.dependencies.includes("gateway")) {
      serviceType = "API Gateway";
    } else if (service.dependencies.includes("eureka-server")) {
      serviceType = "Discovery Server";
    } else if (service.dependencies.includes("config-server")) {
      serviceType = "Config Server";
    } else if (service.dependencies.includes("data-jpa") || 
              service.dependencies.includes("data-mongodb")) {
      serviceType = "Data Service";
    }
    
    serviceTypes[serviceType] = (serviceTypes[serviceType] || 0) + 1;
  });

  const avgDependenciesPerService = totalServices > 0 ? totalDependencies / totalServices : 0;

  return {
    totalServices,
    totalDependencies,
    totalRelationships,
    dependencyCounts,
    avgDependenciesPerService,
    serviceTypes
  };
};

// Component to visualize dependency distribution
const DependencyDistribution = ({ dependencyCounts }: { dependencyCounts: Record<string, number> }) => {
  const total = Object.values(dependencyCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      {Object.entries(dependencyCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([category, count]) => (
          <div key={category}>
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center">
                {categoryIcons[category] || <Box className="h-4 w-4" />}
                <span className="ml-2">{category}</span>
              </div>
              <span>{count}</span>
            </div>
            <Progress value={(count / total) * 100} className="h-2" />
          </div>
        ))}
    </div>
  );
};

// Component to visualize service types
const ServiceTypeDistribution = ({ serviceTypes }: { serviceTypes: Record<string, number> }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(serviceTypes).map(([type, count]) => (
        <Card key={type} className="bg-muted/20">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{type}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              {type === "API Gateway" ? (
                <GitMerge className="h-5 w-5 text-primary" />
              ) : type === "Discovery Server" ? (
                <Globe className="h-5 w-5 text-primary" />
              ) : type === "Config Server" ? (
                <Code className="h-5 w-5 text-primary" />
              ) : type === "Data Service" ? (
                <Database className="h-5 w-5 text-primary" />
              ) : (
                <Box className="h-5 w-5 text-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Most Recently Created Cards
const RecentServicesGrid = ({ services }: { services: Service[] }) => {
  const recentServices = [...services].sort((a, b) => b.id - a.id).slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recentServices.map(service => (
        <Card key={service.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant="outline" className="bg-white/60">
                {service.springBootVersion}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {service.group}.{service.artifact}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-sm">
                {service.language}
              </Badge>
              <Badge variant="secondary" className="rounded-sm">
                {service.buildSystem === 'maven' ? 'Maven' : 
                 service.buildSystem === 'gradle-groovy' ? 'Gradle' : 'Gradle Kotlin'}
              </Badge>
              <Badge variant="secondary" className="rounded-sm">
                Java {service.javaVersion}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {service.dependencies.slice(0, 5).map((dep, i) => (
                <Badge key={i} variant="outline" className="text-xs">{dep}</Badge>
              ))}
              {service.dependencies.length > 5 && (
                <Badge variant="outline" className="text-xs">+{service.dependencies.length - 5}</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 bg-muted/20 flex justify-between border-t">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Recently added
            </div>
            <Link href={`/?service=${service.id}`}>
              <Button variant="ghost" size="sm" className="h-7">View Details</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Main dashboard component
export default function Dashboard() {
  const { services, isLoading } = useServices();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }
  
  const stats = calculateServiceStatistics(services);

  return (
    <div className="space-y-6 p-0.5">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Total Microservices
              </span>
              <span className="text-3xl font-bold">{stats.totalServices}</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Box className="h-4 w-4 mr-1" />
              Created services
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Total Dependencies
              </span>
              <span className="text-3xl font-bold">{stats.totalDependencies}</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Link2 className="h-4 w-4 mr-1" />
              Across all services
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Avg. Dependencies
              </span>
              <span className="text-3xl font-bold">
                {stats.avgDependenciesPerService.toFixed(1)}
              </span>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Database className="h-4 w-4 mr-1" />
              Per service
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                Relationships
              </span>
              <span className="text-3xl font-bold">{stats.totalRelationships}</span>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <GitMerge className="h-4 w-4 mr-1" />
              Between services
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Services</CardTitle>
                  <CardDescription>Your newly created microservices</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentServicesGrid services={services} />
                </CardContent>
                {services.length > 4 && (
                  <CardFooter className="border-t px-6 py-4">
                    <Link href="/">
                      <Button variant="outline">View All Services</Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Service Types</CardTitle>
                  <CardDescription>Distribution by purpose</CardDescription>
                </CardHeader>
                <CardContent>
                  <ServiceTypeDistribution serviceTypes={stats.serviceTypes} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Actions</CardTitle>
                  <CardDescription>Generate your architecture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/architecture" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <GitMerge className="mr-2 h-4 w-4" />
                      View Architecture
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <Shell className="mr-2 h-4 w-4" />
                    Generate Docker Compose
                  </Button>
                  <Button variant="default" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Download All Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service List</CardTitle>
              <CardDescription>Complete list of your microservices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No services created yet. Add your first microservice to get started.
                  </div>
                ) : (
                  services.map(service => (
                    <Card key={service.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-grow p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <Badge>{service.language}</Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Group:</span> {service.group}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Artifact:</span> {service.artifact}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Java:</span> {service.javaVersion}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Build:</span> {
                                service.buildSystem === 'maven' ? 'Maven' : 
                                service.buildSystem === 'gradle-groovy' ? 'Gradle' : 'Gradle Kotlin'
                              }
                            </div>
                            <div>
                              <span className="text-muted-foreground">Spring Boot:</span> {service.springBootVersion}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Package:</span> {service.packaging}
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-1">Dependencies ({service.dependencies.length})</h4>
                            <div className="flex flex-wrap gap-1">
                              {service.dependencies.map((dep, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{dep}</Badge>
                              ))}
                            </div>
                          </div>
                          {service.relationships.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-1">Relationships ({service.relationships.length})</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.relationships.map((rel, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {rel.communicationType} → Service #{rel.targetServiceId}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex md:flex-col border-t md:border-t-0 md:border-l justify-between md:justify-start p-4 bg-muted/20 md:w-40">
                          <Link href={`/?service=${service.id}`}>
                            <Button variant="outline" size="sm" className="w-full mb-2">
                              Edit
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="w-full mb-2">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dependencies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dependency Categories</CardTitle>
                  <CardDescription>Distribution of dependencies by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <DependencyDistribution dependencyCounts={stats.dependencyCounts} />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Dependencies</CardTitle>
                  <CardDescription>Most used across services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      services.flatMap(s => s.dependencies)
                        .reduce<Record<string, number>>((acc, dep) => {
                          acc[dep] = (acc[dep] || 0) + 1;
                          return acc;
                        }, {})
                    )
                      .sort(([, countA], [, countB]) => countB - countA)
                      .slice(0, 5)
                      .map(([dep, count]) => (
                        <div key={dep} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {getDependencyCategory(dep) === "Web" ? (
                                <Globe className="h-4 w-4 text-primary" />
                              ) : getDependencyCategory(dep) === "SQL" ? (
                                <Database className="h-4 w-4 text-primary" />
                              ) : getDependencyCategory(dep) === "Cloud" ? (
                                <GitMerge className="h-4 w-4 text-primary" />
                              ) : getDependencyCategory(dep) === "Security" ? (
                                <Lock className="h-4 w-4 text-primary" />
                              ) : (
                                <Box className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{dep}</div>
                              <div className="text-xs text-muted-foreground">
                                {getDependencyCategory(dep)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}