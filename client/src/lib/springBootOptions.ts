// Spring Boot versions
export const springBootVersions = [
  { value: "3.4.4", label: "3.4.4" },
  { value: "3.5.0-M3", label: "3.5.0 (M3)" },
  { value: "3.3.10", label: "3.3.10" },
];

// Build systems
export const buildSystems = [
  { value: "gradle-groovy", label: "Gradle - Groovy" },
  { value: "gradle-kotlin", label: "Gradle - Kotlin" },
  { value: "maven", label: "Maven" },
];

// Languages
export const languages = [
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "groovy", label: "Groovy" },
];

// Java versions
export const javaVersions = [
  { value: "17", label: "17" },
  { value: "21", label: "21" },
  { value: "24", label: "24" },
];

// Default service configuration
export const defaultServiceConfig = {
  buildSystem: "maven",
  language: "java",
  springBootVersion: "3.4.4",
  packaging: "jar",
  javaVersion: "17",
  dependencies: ["web", "actuator"],
};
