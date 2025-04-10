import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServiceSchema, projectMetadataSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { generateProjectZip, generateAllProjectsZip } from "./utils/projectGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all services
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to get services", error: (error as Error).message });
    }
  });

  // Get a specific service
  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to get service", error: (error as Error).message });
    }
  });

  // Create a new service
  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service", error: (error as Error).message });
    }
  });

  // Update a service
  app.put("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = projectMetadataSchema.parse(req.body);
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const updatedService = await storage.updateService(id, serviceData);
      res.json(updatedService);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service", error: (error as Error).message });
    }
  });

  // Update service dependencies
  app.put("/api/services/:id/dependencies", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { dependencies } = z.object({
        dependencies: z.array(z.string())
      }).parse(req.body);
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const updatedService = await storage.updateServiceDependencies(id, dependencies);
      res.json(updatedService);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid dependencies data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update dependencies", error: (error as Error).message });
    }
  });

  // Update service relationships
  app.put("/api/services/:id/relationships", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { relationships } = z.object({
        relationships: z.array(z.object({
          sourceServiceId: z.number(),
          targetServiceId: z.number(),
          communicationType: z.string()
        }))
      }).parse(req.body);
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const updatedService = await storage.updateServiceRelationships(id, relationships);
      res.json(updatedService);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid relationships data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update relationships", error: (error as Error).message });
    }
  });

  // Delete a service
  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service", error: (error as Error).message });
    }
  });

  // Generate project ZIP for a single service
  app.post("/api/generate/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const zipBuffer = await generateProjectZip(service);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=${service.name}.zip`);
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate project", error: (error as Error).message });
    }
  });

  // Generate ZIP for all services
  app.post("/api/generate-all", async (req: Request, res: Response) => {
    try {
      const services = await storage.getAllServices();
      
      if (services.length === 0) {
        return res.status(400).json({ message: "No services to generate" });
      }
      
      const zipBuffer = await generateAllProjectsZip(services);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=microservices.zip');
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate projects", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
