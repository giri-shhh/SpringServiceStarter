import { type Service, type InsertService, type Relationship, projectMetadataSchema } from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // Service methods
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service>;
  updateServiceDependencies(id: number, dependencies: string[]): Promise<Service>;
  updateServiceRelationships(id: number, relationships: Relationship[]): Promise<Service>;
  deleteService(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private services: Map<number, Service>;
  private currentId: number;

  constructor() {
    this.services = new Map();
    this.currentId = 1;
  }

  // Get all services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  // Get a specific service by ID
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  // Create a new service
  async createService(serviceData: InsertService): Promise<Service> {
    const id = this.currentId++;
    
    // Convert dependencies and relationships to ensure they have the right type
    const dependencies: string[] = [];
    if (Array.isArray(serviceData.dependencies)) {
      serviceData.dependencies.forEach(dep => {
        dependencies.push(String(dep));
      });
    }
    
    const relationships: Relationship[] = [];
    if (Array.isArray(serviceData.relationships)) {
      serviceData.relationships.forEach(rel => {
        if (typeof rel === 'object' && rel !== null) {
          relationships.push({
            sourceServiceId: Number(rel.sourceServiceId),
            targetServiceId: Number(rel.targetServiceId),
            communicationType: String(rel.communicationType)
          });
        }
      });
    }
    
    // Create a properly typed Service object
    const service: Service = { 
      id,
      name: serviceData.name,
      buildSystem: serviceData.buildSystem,
      language: serviceData.language,
      springBootVersion: serviceData.springBootVersion,
      group: serviceData.group,
      artifact: serviceData.artifact,
      description: serviceData.description,
      packageName: serviceData.packageName,
      packaging: serviceData.packaging,
      javaVersion: serviceData.javaVersion,
      dependencies,
      relationships
    };
    
    this.services.set(id, service);
    return service;
  }

  // Update a service
  async updateService(id: number, serviceData: Partial<Service>): Promise<Service> {
    const existingService = this.services.get(id);
    if (!existingService) {
      throw new Error(`Service with ID ${id} not found`);
    }

    const updatedService = { ...existingService, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Update service dependencies
  async updateServiceDependencies(id: number, dependencies: string[]): Promise<Service> {
    const existingService = this.services.get(id);
    if (!existingService) {
      throw new Error(`Service with ID ${id} not found`);
    }

    const updatedService = { ...existingService, dependencies };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Update service relationships
  async updateServiceRelationships(id: number, relationships: Relationship[]): Promise<Service> {
    const existingService = this.services.get(id);
    if (!existingService) {
      throw new Error(`Service with ID ${id} not found`);
    }

    const updatedService = { ...existingService, relationships };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Delete a service
  async deleteService(id: number): Promise<void> {
    if (!this.services.has(id)) {
      throw new Error(`Service with ID ${id} not found`);
    }
    this.services.delete(id);
  }
}

// Export the storage instance
export const storage = new MemStorage();
