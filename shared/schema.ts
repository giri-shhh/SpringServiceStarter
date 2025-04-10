import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the MicroserviceConfig type that holds the configuration for a single microservice
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  buildSystem: text("build_system").notNull(), // maven, gradle-groovy, gradle-kotlin
  language: text("language").notNull(), // java, kotlin, groovy
  springBootVersion: text("spring_boot_version").notNull(),
  group: text("group").notNull(),
  artifact: text("artifact").notNull(),
  description: text("description").notNull(),
  packageName: text("package_name").notNull(),
  packaging: text("packaging").notNull(), // jar, war
  javaVersion: text("java_version").notNull(),
  dependencies: jsonb("dependencies").notNull().$type<string[]>(), // Array of dependency IDs
  relationships: jsonb("relationships").notNull().$type<Relationship[]>(), // Array of relationships
});

// Define the relationship type
export type Relationship = {
  sourceServiceId: number;
  targetServiceId: number;
  communicationType: string; // REST, Message Queue, gRPC
};

// Dependencies schema will be used to describe available Spring Boot dependencies
export const dependencies = pgTable("dependencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  group: text("group").notNull(), // Web, SQL, NoSQL, Cloud, etc.
  artifactId: text("artifact_id").notNull(), // The actual Maven/Gradle artifact ID
});

// Insert schemas
export const insertServiceSchema = createInsertSchema(services);
export const insertDependencySchema = createInsertSchema(dependencies);

// Export types
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Dependency = typeof dependencies.$inferSelect;
export type InsertDependency = z.infer<typeof insertDependencySchema>;

// Project metadata validation schema
export const projectMetadataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  buildSystem: z.enum(["maven", "gradle-groovy", "gradle-kotlin"]),
  language: z.enum(["java", "kotlin", "groovy"]),
  springBootVersion: z.string().min(1, "Spring Boot version is required"),
  group: z.string().min(1, "Group is required"),
  artifact: z.string().min(1, "Artifact is required"),
  description: z.string(),
  packageName: z.string().min(1, "Package name is required"),
  packaging: z.enum(["jar", "war"]),
  javaVersion: z.enum(["17", "21", "24"]),
  dependencies: z.array(z.string()),
});

export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
