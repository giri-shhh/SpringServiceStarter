import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudCog,
  Code2,
  Database,
  FileCode,
  FileJson,
  GitBranchPlus,
  Globe,
  Lock,
  MessagesSquare,
  Package,
  Server,
  Settings,
  Shield,
} from "lucide-react";
import {
  springBootVersions,
  javaVersions,
  buildSystems,
  languages,
  defaultServiceConfig,
} from "@/lib/springBootOptions";

// Spring Boot dependencies by category
const springBootDependencies = [
  {
    category: "Web",
    icon: <Globe className="h-4 w-4" />,
    dependencies: [
      { id: "web", name: "Spring Web", description: "Build web applications using Spring MVC" },
      { id: "webflux", name: "Spring Reactive Web", description: "Build reactive web applications" },
      { id: "graphql", name: "Spring GraphQL", description: "Build GraphQL applications" },
      { id: "hateoas", name: "Spring HATEOAS", description: "HATEOAS for RESTful services" },
      { id: "websocket", name: "WebSocket", description: "WebSocket support" },
      { id: "openapi", name: "OpenAPI (Swagger)", description: "API documentation" },
    ]
  },
  {
    category: "Data",
    icon: <Database className="h-4 w-4" />,
    dependencies: [
      { id: "data-jpa", name: "Spring Data JPA", description: "JPA persistence with Hibernate" },
      { id: "mysql", name: "MySQL Driver", description: "MySQL JDBC driver" },
      { id: "postgresql", name: "PostgreSQL Driver", description: "PostgreSQL JDBC driver" },
      { id: "h2", name: "H2 Database", description: "H2 in-memory database" },
      { id: "data-mongodb", name: "Spring Data MongoDB", description: "MongoDB document database" },
      { id: "data-redis", name: "Spring Data Redis", description: "Redis key-value store" },
      { id: "liquibase", name: "Liquibase", description: "Database schema evolution" },
    ]
  },
  {
    category: "Microservices",
    icon: <Server className="h-4 w-4" />,
    dependencies: [
      { id: "eureka", name: "Eureka Client", description: "Service discovery client" },
      { id: "eureka-server", name: "Eureka Server", description: "Service discovery server" },
      { id: "config-client", name: "Config Client", description: "Spring Cloud Config client" },
      { id: "config-server", name: "Config Server", description: "Spring Cloud Config server" },
      { id: "gateway", name: "Gateway", description: "API Gateway with Spring Cloud Gateway" },
      { id: "circuit-breaker", name: "Circuit Breaker", description: "Resilience patterns with Resilience4j" },
    ]
  },
  {
    category: "Messaging",
    icon: <MessagesSquare className="h-4 w-4" />,
    dependencies: [
      { id: "kafka", name: "Spring for Apache Kafka", description: "Kafka messaging" },
      { id: "amqp", name: "Spring AMQP (RabbitMQ)", description: "AMQP messaging with RabbitMQ" },
      { id: "jms", name: "Spring JMS", description: "JMS messaging" },
    ]
  },
  {
    category: "Observability",
    icon: <Settings className="h-4 w-4" />,
    dependencies: [
      { id: "actuator", name: "Spring Boot Actuator", description: "Production-ready features" },
      { id: "prometheus", name: "Prometheus", description: "Prometheus metrics" },
      { id: "zipkin", name: "Zipkin", description: "Distributed tracing" },
    ]
  },
  {
    category: "Security",
    icon: <Shield className="h-4 w-4" />,
    dependencies: [
      { id: "security", name: "Spring Security", description: "Authentication and authorization" },
      { id: "oauth2-client", name: "OAuth2 Client", description: "OAuth 2.0 client support" },
      { id: "oauth2-resource-server", name: "OAuth2 Resource Server", description: "OAuth 2.0 resource server" },
    ]
  },
  {
    category: "Developer Tools",
    icon: <Code2 className="h-4 w-4" />,
    dependencies: [
      { id: "devtools", name: "Spring Boot DevTools", description: "Development-time tools" },
      { id: "lombok", name: "Lombok", description: "Java annotation library" },
      { id: "testcontainers", name: "Testcontainers", description: "Container-based testing" },
    ]
  },
];

// Cloud provider services
const cloudProviders = [
  {
    name: "AWS",
    dependencies: [
      { id: "aws-rds", name: "AWS RDS", description: "Managed relational database service", category: "Database" },
      { id: "aws-dynamodb", name: "AWS DynamoDB", description: "NoSQL database service", category: "Database" },
      { id: "aws-s3", name: "AWS S3", description: "Object storage service", category: "Storage" },
      { id: "aws-lambda", name: "AWS Lambda", description: "Serverless compute service", category: "Compute" },
      { id: "aws-sns", name: "AWS SNS", description: "Simple Notification Service", category: "Messaging" },
      { id: "aws-sqs", name: "AWS SQS", description: "Simple Queue Service", category: "Messaging" },
    ]
  },
  {
    name: "Azure",
    dependencies: [
      { id: "azure-cosmos-db", name: "Azure Cosmos DB", description: "Globally distributed multi-model database", category: "Database" },
      { id: "azure-sql", name: "Azure SQL", description: "Managed SQL database service", category: "Database" },
      { id: "azure-storage", name: "Azure Storage", description: "Cloud storage solution", category: "Storage" },
      { id: "azure-functions", name: "Azure Functions", description: "Serverless compute service", category: "Compute" },
      { id: "azure-service-bus", name: "Azure Service Bus", description: "Enterprise message broker", category: "Messaging" },
      { id: "azure-event-hub", name: "Azure Event Hub", description: "Big data streaming platform", category: "Messaging" },
    ]
  },
  {
    name: "Google Cloud",
    dependencies: [
      { id: "gcp-cloud-sql", name: "GCP Cloud SQL", description: "Managed database service", category: "Database" },
      { id: "gcp-firestore", name: "GCP Firestore", description: "NoSQL document database", category: "Database" },
      { id: "gcp-cloud-storage", name: "GCP Cloud Storage", description: "Object storage service", category: "Storage" },
      { id: "gcp-cloud-functions", name: "GCP Cloud Functions", description: "Serverless compute platform", category: "Compute" },
      { id: "gcp-pub-sub", name: "GCP Pub/Sub", description: "Messaging and ingestion service", category: "Messaging" },
    ]
  }
];

// Service types to offer preconfigured setups
const serviceTypes = [
  { 
    id: "basic", 
    name: "Basic Service", 
    description: "Simple REST API service",
    dependencies: ["web", "actuator"] 
  },
  { 
    id: "data", 
    name: "Data Service", 
    description: "Service with database access",
    dependencies: ["web", "data-jpa", "actuator", "h2"] 
  },
  { 
    id: "gateway", 
    name: "API Gateway", 
    description: "Entry point for the microservice architecture",
    dependencies: ["gateway", "eureka", "actuator"] 
  },
  { 
    id: "discovery", 
    name: "Discovery Server", 
    description: "Service registry for microservices",
    dependencies: ["eureka-server", "actuator"] 
  },
  { 
    id: "config", 
    name: "Config Server", 
    description: "Centralized configuration server",
    dependencies: ["config-server", "actuator"] 
  },
  { 
    id: "auth", 
    name: "Auth Service", 
    description: "Authentication and authorization service",
    dependencies: ["web", "security", "data-jpa", "h2", "actuator"] 
  }
];

const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  buildSystem: z.string(),
  language: z.string(),
  springBootVersion: z.string(),
  group: z.string().min(1, "Group is required"),
  artifact: z.string().min(1, "Artifact is required"),
  description: z.string().optional(),
  packageName: z.string(),
  packaging: z.string(),
  javaVersion: z.string(),
  serviceType: z.string().optional(),
  dependencies: z.array(z.string()),
  relationships: z.array(z.any()),
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateServiceModal({ isOpen, onClose }: CreateServiceModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(["web", "actuator"]);
  const [selectedServiceType, setSelectedServiceType] = useState("basic");
  
  // Setup the form with default values
  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      buildSystem: defaultServiceConfig.buildSystem,
      language: defaultServiceConfig.language,
      springBootVersion: defaultServiceConfig.springBootVersion,
      group: defaultServiceConfig.group,
      artifact: "",
      description: "",
      packageName: defaultServiceConfig.packageName,
      packaging: defaultServiceConfig.packaging,
      javaVersion: defaultServiceConfig.javaVersion,
      serviceType: "basic",
      dependencies: ["web", "actuator"],
      relationships: [],
    },
  });
  
  // Watch for name, group, and artifact changes to update packageName
  const watchName = form.watch("name");
  const watchGroup = form.watch("group");
  const watchArtifact = form.watch("artifact");
  
  // Auto-update artifact when name changes
  if (watchName && !form.getValues("artifact")) {
    const kebabCaseName = watchName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    form.setValue("artifact", kebabCaseName);
  }
  
  // Auto-update packageName when group and artifact change
  if (watchGroup && watchArtifact && !form.getValues("packageName")) {
    form.setValue("packageName", `${watchGroup}.${watchArtifact.replace(/-/g, "")}`);
  }
  
  // Handle toggling a dependency
  const toggleDependency = (dependencyId: string) => {
    setSelectedDependencies(prevDeps => {
      if (prevDeps.includes(dependencyId)) {
        return prevDeps.filter(dep => dep !== dependencyId);
      } else {
        return [...prevDeps, dependencyId];
      }
    });
  };
  
  // Handle changing the service type
  const handleServiceTypeChange = (typeId: string) => {
    setSelectedServiceType(typeId);
    // Set the dependencies for the selected service type
    const selectedType = serviceTypes.find(type => type.id === typeId);
    if (selectedType) {
      setSelectedDependencies(selectedType.dependencies);
    }
  };
  
  // Continue to the next tab
  const handleContinue = () => {
    if (currentTab === "basic") {
      // Validate required fields before proceeding
      form.trigger(["name", "group", "artifact"]).then(isValid => {
        if (isValid) {
          setCurrentTab("dependencies");
        }
      });
    } else if (currentTab === "dependencies") {
      setCurrentTab("cloud");
    } else if (currentTab === "cloud") {
      // Set the selected dependencies and submit the form
      form.setValue("dependencies", selectedDependencies);
      form.handleSubmit(onSubmit)();
    }
  };
  
  // Submit the form
  const onSubmit = async (data: CreateServiceFormData) => {
    setIsSubmitting(true);
    try {
      // Update dependencies with the selected ones
      data.dependencies = selectedDependencies;
      
      // Create the service
      await apiRequest("POST", "/api/services", data);
      
      // Invalidate services query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      // Show success toast
      toast({
        title: "Service created",
        description: `The ${data.name} microservice has been successfully created.`,
      });
      
      // Reset and close
      form.reset();
      setSelectedDependencies(["web", "actuator"]);
      setCurrentTab("basic");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle modal closing
  const handleModalClose = () => {
    form.reset();
    setSelectedDependencies(["web", "actuator"]);
    setCurrentTab("basic");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
            Create Spring Boot Microservice
          </DialogTitle>
          <DialogDescription>
            Configure your service, add dependencies, and integrate with cloud providers
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Info
              {currentTab !== "basic" && form.formState.isValid && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="flex items-center gap-2">
              <GitBranchPlus className="h-4 w-4" />
              Dependencies
              {currentTab !== "dependencies" && selectedDependencies.length > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedDependencies.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Services
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Service Configuration</CardTitle>
                  <CardDescription>
                    Configure the basic properties of your microservice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="serviceType" className="text-sm font-medium">
                          Service Type
                        </Label>
                        <Select
                          defaultValue={selectedServiceType}
                          onValueChange={handleServiceTypeChange}
                        >
                          <SelectTrigger id="serviceType" className="mt-1">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map(type => (
                              <SelectItem key={type.id} value={type.id} textValue={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {serviceTypes.find(type => type.id === selectedServiceType)?.description}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Service Name*
                        </Label>
                        <Input
                          id="name"
                          className="mt-1"
                          placeholder="User Service"
                          {...form.register("name", { required: true })}
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="group" className="text-sm font-medium">
                            Group*
                          </Label>
                          <Input
                            id="group"
                            className="mt-1"
                            placeholder="com.example"
                            {...form.register("group", { required: true })}
                          />
                          {form.formState.errors.group && (
                            <p className="text-xs text-red-500 mt-1">
                              {form.formState.errors.group.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="artifact" className="text-sm font-medium">
                            Artifact*
                          </Label>
                          <Input
                            id="artifact"
                            className="mt-1"
                            placeholder="user-service"
                            {...form.register("artifact", { required: true })}
                          />
                          {form.formState.errors.artifact && (
                            <p className="text-xs text-red-500 mt-1">
                              {form.formState.errors.artifact.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="packageName" className="text-sm font-medium">
                          Package Name
                        </Label>
                        <Input
                          id="packageName"
                          className="mt-1"
                          placeholder="com.example.userservice"
                          {...form.register("packageName")}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          className="mt-1 min-h-[80px]"
                          placeholder="Describe the purpose of this microservice"
                          {...form.register("description")}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="language" className="text-sm font-medium">
                            Language
                          </Label>
                          <Select
                            defaultValue={form.getValues("language")}
                            onValueChange={(value) => form.setValue("language", value)}
                          >
                            <SelectTrigger id="language" className="mt-1">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang} value={lang} textValue={lang}>
                                  {lang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="springBootVersion" className="text-sm font-medium">
                            Spring Boot
                          </Label>
                          <Select
                            defaultValue={form.getValues("springBootVersion")}
                            onValueChange={(value) => form.setValue("springBootVersion", value)}
                          >
                            <SelectTrigger id="springBootVersion" className="mt-1">
                              <SelectValue placeholder="Select version" />
                            </SelectTrigger>
                            <SelectContent>
                              {springBootVersions.map(version => (
                                <SelectItem key={version} value={version} textValue={version}>
                                  {version}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buildSystem" className="text-sm font-medium">
                            Build System
                          </Label>
                          <Select
                            defaultValue={form.getValues("buildSystem")}
                            onValueChange={(value) => form.setValue("buildSystem", value)}
                          >
                            <SelectTrigger id="buildSystem" className="mt-1">
                              <SelectValue placeholder="Select build system" />
                            </SelectTrigger>
                            <SelectContent>
                              {buildSystems.map(system => {
                                const label = system === "maven" ? "Maven" : 
                                            system === "gradle-groovy" ? "Gradle (Groovy)" : 
                                            "Gradle (Kotlin)";
                                return (
                                  <SelectItem key={system} value={system} textValue={label}>
                                    {label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="javaVersion" className="text-sm font-medium">
                            Java Version
                          </Label>
                          <Select
                            defaultValue={form.getValues("javaVersion")}
                            onValueChange={(value) => form.setValue("javaVersion", value)}
                          >
                            <SelectTrigger id="javaVersion" className="mt-1">
                              <SelectValue placeholder="Select Java version" />
                            </SelectTrigger>
                            <SelectContent>
                              {javaVersions.map(version => (
                                <SelectItem key={version} value={version} textValue={version}>
                                  {version}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleModalClose}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Dependencies Tab */}
            <TabsContent value="dependencies">
              <Card>
                <CardHeader>
                  <CardTitle>Spring Boot Dependencies</CardTitle>
                  <CardDescription>
                    Select the dependencies for your microservice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Selected Dependencies:</h3>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {selectedDependencies.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No dependencies selected</p>
                      ) : (
                        selectedDependencies.map(depId => {
                          // Find the dependency name
                          let depName = depId;
                          for (const category of springBootDependencies) {
                            const dep = category.dependencies.find(d => d.id === depId);
                            if (dep) {
                              depName = dep.name;
                              break;
                            }
                          }
                          return (
                            <Badge 
                              key={depId} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => toggleDependency(depId)}
                            >
                              {depName} ×
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Accordion type="single" collapsible className="w-full">
                    {springBootDependencies.map((category, index) => (
                      <AccordionItem key={category.category} value={`item-${index}`}>
                        <AccordionTrigger className="flex items-center text-sm">
                          <div className="flex items-center">
                            {category.icon}
                            <span className="ml-2">{category.category}</span>
                            <Badge variant="outline" className="ml-2">
                              {category.dependencies.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
                            {category.dependencies.map(dependency => (
                              <div 
                                key={dependency.id}
                                className={`flex items-start space-x-2 rounded-lg border p-3 hover:bg-muted cursor-pointer transition-colors ${
                                  selectedDependencies.includes(dependency.id) ? 'bg-primary/5 border-primary/50' : ''
                                }`}
                                onClick={() => toggleDependency(dependency.id)}
                              >
                                <Checkbox
                                  checked={selectedDependencies.includes(dependency.id)}
                                  onCheckedChange={() => {}}
                                  className="mt-1"
                                />
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{dependency.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {dependency.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentTab("basic")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Cloud Services Tab */}
            <TabsContent value="cloud">
              <Card>
                <CardHeader>
                  <CardTitle>Cloud Provider Services</CardTitle>
                  <CardDescription>
                    Add cloud service dependencies to your microservice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cloudProviders.map(provider => (
                      <div key={provider.name} className="border rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <CloudCog className="h-5 w-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">{provider.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {provider.dependencies.map(service => (
                            <div 
                              key={service.id}
                              className={`flex items-start space-x-2 rounded-lg border p-3 hover:bg-muted cursor-pointer transition-colors ${
                                selectedDependencies.includes(service.id) ? 'bg-primary/5 border-primary/50' : ''
                              }`}
                              onClick={() => toggleDependency(service.id)}
                            >
                              <Checkbox
                                checked={selectedDependencies.includes(service.id)}
                                onCheckedChange={() => {}}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <p className="font-medium text-sm">{service.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {service.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentTab("dependencies")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                  >
                    {isSubmitting ? "Creating..." : "Create Microservice"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
