// Spring Boot versions
export const springBootVersions = ["3.4.4", "3.5.0-M3", "3.3.10"];

// Build systems
export const buildSystems = ["maven", "gradle-groovy", "gradle-kotlin"];

// Languages
export const languages = ["java", "kotlin", "groovy"];

// Java versions
export const javaVersions = ["17", "21", "24"];

// Default service configuration
export const defaultServiceConfig = {
  buildSystem: "maven",
  language: "java",
  springBootVersion: "3.4.4",
  packaging: "jar",
  javaVersion: "17",
  dependencies: ["web", "actuator"],
};
