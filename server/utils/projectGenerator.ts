import { Service } from "@shared/schema";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import stream from "stream";
import ejs from "ejs";

const pipeline = promisify(stream.pipeline);

// Create directories for Maven and Gradle projects
const createDirectoryStructure = (
  service: Service,
  rootPath: string
) => {
  const packagePath = service.packageName.replace(/\./g, "/");
  const baseSourceDir = path.join(
    rootPath,
    "src/main",
    service.language === "kotlin" ? "kotlin" : service.language,
    packagePath
  );

  // Create main directories
  fs.mkdirSync(baseSourceDir, { recursive: true });
  fs.mkdirSync(path.join(rootPath, "src/main/resources"), { recursive: true });
  fs.mkdirSync(path.join(rootPath, "src/test"), { recursive: true });

  return { baseSourceDir, packagePath };
};

// Generate application properties
const generateApplicationProperties = (service: Service) => {
  let properties = `spring.application.name=${service.name}\nserver.port=8080\n`;

  // Add additional properties based on dependencies
  if (service.dependencies.includes("data-jpa")) {
    if (service.dependencies.includes("h2")) {
      properties += `\n# H2 Database Configuration\nspring.datasource.url=jdbc:h2:mem:${service.name.replace(/-/g, "")}\nspring.datasource.driverClassName=org.h2.Driver\nspring.datasource.username=sa\nspring.datasource.password=\nspring.jpa.database-platform=org.hibernate.dialect.H2Dialect\nspring.h2.console.enabled=true\n`;
    } else if (service.dependencies.includes("mysql")) {
      properties += `\n# MySQL Database Configuration\nspring.datasource.url=jdbc:mysql://localhost:3306/${service.name.replace(/-/g, "")}\nspring.datasource.username=root\nspring.datasource.password=\nspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver\nspring.jpa.hibernate.ddl-auto=update\n`;
    } else if (service.dependencies.includes("postgresql")) {
      properties += `\n# PostgreSQL Database Configuration\nspring.datasource.url=jdbc:postgresql://localhost:5432/${service.name.replace(/-/g, "")}\nspring.datasource.username=postgres\nspring.datasource.password=postgres\nspring.jpa.hibernate.ddl-auto=update\n`;
    }
  }

  // Add Eureka client config if present
  if (service.dependencies.includes("eureka")) {
    properties += `\n# Eureka Client Configuration\neureka.client.service-url.defaultZone=http://localhost:8761/eureka/\neureka.instance.prefer-ip-address=true\n`;
  }

  // Add config client settings if present
  if (service.dependencies.includes("config-client")) {
    properties += `\n# Config Client Configuration\nspring.config.import=optional:configserver:http://localhost:8888\n`;
  }

  return properties;
};

// Generate pom.xml for Maven projects
const generatePomXml = (service: Service) => {
  const dependencies: string[] = [];

  // Add Spring Boot starter web if present
  if (service.dependencies.includes("web")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>`);
  }

  // Add Reactive web if present
  if (service.dependencies.includes("webflux")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>`);
  }

  // Add JPA if present
  if (service.dependencies.includes("data-jpa")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>`);
  }

  // Add MySQL if present
  if (service.dependencies.includes("mysql")) {
    dependencies.push(`
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }

  // Add PostgreSQL if present
  if (service.dependencies.includes("postgresql")) {
    dependencies.push(`
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }

  // Add H2 if present
  if (service.dependencies.includes("h2")) {
    dependencies.push(`
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`);
  }

  // Add Spring Security if present
  if (service.dependencies.includes("security")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>`);
  }

  // Add actuator
  if (service.dependencies.includes("actuator")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>`);
  }

  // Add Eureka client
  if (service.dependencies.includes("eureka")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>`);
  }

  // Add Config client
  if (service.dependencies.includes("config-client")) {
    dependencies.push(`
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>`);
  }

  // Add testing dependencies
  dependencies.push(`
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>`);

  // Handle Spring Cloud dependencies
  const hasSpringCloudDeps = service.dependencies.some(dep => 
    ["eureka", "config-client", "gateway", "config-server", "eureka-server"].includes(dep)
  );

  const springCloudDependencyManagement = hasSpringCloudDeps ? `
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>\${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>` : '';

  const springCloudProperties = hasSpringCloudDeps ? `
        <spring-cloud.version>2023.0.0</spring-cloud.version>` : '';

  // Generate the XML
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${service.springBootVersion}</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>${service.group}</groupId>
    <artifactId>${service.artifact}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${service.name}</name>
    <description>${service.description}</description>
    <properties>
        <java.version>${service.javaVersion}</java.version>${springCloudProperties}
    </properties>
    <dependencies>${dependencies.join('')}
    </dependencies>${springCloudDependencyManagement}

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>`;
};

// Generate build.gradle for Gradle projects
const generateBuildGradle = (service: Service) => {
  const plugins: string[] = ["id 'java'", "id 'org.springframework.boot' version '" + service.springBootVersion + "'", "id 'io.spring.dependency-management' version '1.1.4'"];
  
  if (service.language === "kotlin") {
    plugins.push("id 'org.jetbrains.kotlin.jvm' version '1.9.20'");
    plugins.push("id 'org.jetbrains.kotlin.plugin.spring' version '1.9.20'");
  }

  // Dependencies
  const dependencies: string[] = [];

  // Add Spring Boot starter web if present
  if (service.dependencies.includes("web")) {
    dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-web'`);
  }

  // Add Reactive web if present
  if (service.dependencies.includes("webflux")) {
    dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-webflux'`);
  }

  // Add JPA if present
  if (service.dependencies.includes("data-jpa")) {
    dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-data-jpa'`);
  }

  // Add MySQL if present
  if (service.dependencies.includes("mysql")) {
    dependencies.push(`runtimeOnly 'com.mysql:mysql-connector-j'`);
  }

  // Add PostgreSQL if present
  if (service.dependencies.includes("postgresql")) {
    dependencies.push(`runtimeOnly 'org.postgresql:postgresql'`);
  }

  // Add H2 if present
  if (service.dependencies.includes("h2")) {
    dependencies.push(`runtimeOnly 'com.h2database:h2'`);
  }

  // Add Spring Security if present
  if (service.dependencies.includes("security")) {
    dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-security'`);
  }

  // Add actuator
  if (service.dependencies.includes("actuator")) {
    dependencies.push(`implementation 'org.springframework.boot:spring-boot-starter-actuator'`);
  }

  // Add Eureka client
  if (service.dependencies.includes("eureka")) {
    dependencies.push(`implementation 'org.springframework.cloud:spring-cloud-starter-netflix-eureka-client'`);
  }

  // Add Config client
  if (service.dependencies.includes("config-client")) {
    dependencies.push(`implementation 'org.springframework.cloud:spring-cloud-starter-config'`);
  }

  // Add testing dependencies
  dependencies.push(`testImplementation 'org.springframework.boot:spring-boot-starter-test'`);

  // Handle Spring Cloud dependencies
  const hasSpringCloudDeps = service.dependencies.some(dep => 
    ["eureka", "config-client", "gateway", "config-server", "eureka-server"].includes(dep)
  );

  const springCloudDependencyManagement = hasSpringCloudDeps ? `
ext {
    set('springCloudVersion', "2023.0.0")
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:\${springCloudVersion}"
    }
}` : '';

  // Generate the build.gradle file
  if (service.buildSystem === "gradle-groovy") {
    return `plugins {
    ${plugins.join('\n    ')}
}

group = '${service.group}'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '${service.javaVersion}'

repositories {
    mavenCentral()
}
${springCloudDependencyManagement}

dependencies {
    ${dependencies.join('\n    ')}
}

tasks.named('test') {
    useJUnitPlatform()
}`;
  } else { // Gradle Kotlin
    return `plugins {
    ${plugins.join('\n    ')}
}

group = "${service.group}"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_${service.javaVersion}

repositories {
    mavenCentral()
}
${springCloudDependencyManagement}

dependencies {
    ${dependencies.join('\n    ')}
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "${service.javaVersion}"
    }
}`;
  }
};

// Generate the main application class
const generateMainApplicationClass = (service: Service) => {
  const className = service.name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Application';

  // Determine annotations needed
  const annotations = [];
  annotations.push('@SpringBootApplication');
  
  if (service.dependencies.includes("eureka")) {
    annotations.push('@EnableEurekaClient');
  }

  // Generate Java code
  if (service.language === 'java') {
    return `package ${service.packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
${service.dependencies.includes("eureka") ? 'import org.springframework.cloud.netflix.eureka.EnableEurekaClient;\n' : ''}

${annotations.join('\n')}
public class ${className} {

    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }

}`;
  } 
  // Generate Kotlin code
  else if (service.language === 'kotlin') {
    return `package ${service.packageName}

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
${service.dependencies.includes("eureka") ? 'import org.springframework.cloud.netflix.eureka.EnableEurekaClient\n' : ''}

${annotations.join('\n')}
class ${className}

fun main(args: Array<String>) {
    runApplication<${className}>(*args)
}`;
  } 
  // Generate Groovy code
  else {
    return `package ${service.packageName}

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
${service.dependencies.includes("eureka") ? 'import org.springframework.cloud.netflix.eureka.EnableEurekaClient\n' : ''}

${annotations.join('\n')}
class ${className} {

    static void main(String[] args) {
        SpringApplication.run(${className}, args)
    }

}`;
  }
};

// Generate a sample controller
const generateSampleController = (service: Service) => {
  const className = service.name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Controller';

  // Generate Java code
  if (service.language === 'java') {
    return `package ${service.packageName}.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
public class ${className} {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from ${service.name}!");
        response.put("service", "${service.name}");
        return ResponseEntity.ok(response);
    }
}`;
  } 
  // Generate Kotlin code
  else if (service.language === 'kotlin') {
    return `package ${service.packageName}.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.ResponseEntity

@RestController
class ${className} {

    @GetMapping("/")
    fun hello(): ResponseEntity<Map<String, String>> {
        val response = mapOf(
            "message" to "Hello from ${service.name}!",
            "service" to "${service.name}"
        )
        return ResponseEntity.ok(response)
    }
}`;
  } 
  // Generate Groovy code
  else {
    return `package ${service.packageName}.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.http.ResponseEntity

@RestController
class ${className} {

    @GetMapping("/")
    ResponseEntity<Map<String, String>> hello() {
        def response = [
            message: "Hello from ${service.name}!",
            service: "${service.name}"
        ]
        return ResponseEntity.ok(response)
    }
}`;
  }
};

// Generate a complete Spring Boot project ZIP
export const generateProjectZip = async (service: Service): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      const buffers: Buffer[] = [];
      archive.on('data', (data) => buffers.push(data));
      archive.on('end', () => resolve(Buffer.concat(buffers)));
      archive.on('error', (err) => reject(err));

      // Get file extension based on language
      const fileExt = service.language === 'java' ? '.java' : 
                    service.language === 'kotlin' ? '.kt' : '.groovy';
      
      // Create the base structure
      const projectRoot = service.name;
      
      // Create package directories
      const packagePath = service.packageName.replace(/\./g, '/');
      
      // Add build files
      if (service.buildSystem === 'maven') {
        archive.append(generatePomXml(service), { name: `${projectRoot}/pom.xml` });
      } else if (service.buildSystem === 'gradle-groovy') {
        archive.append(generateBuildGradle(service), { name: `${projectRoot}/build.gradle` });
      } else { // gradle-kotlin
        archive.append(generateBuildGradle(service), { name: `${projectRoot}/build.gradle.kts` });
      }
      
      // Add application.properties
      archive.append(
        generateApplicationProperties(service),
        { name: `${projectRoot}/src/main/resources/application.properties` }
      );
      
      // Add main application class
      const mainClassName = service.name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Application';
        
      archive.append(
        generateMainApplicationClass(service),
        { name: `${projectRoot}/src/main/${service.language === 'kotlin' ? 'kotlin' : service.language}/${packagePath}/${mainClassName}${fileExt}` }
      );

      // Add sample controller if web dependency is included
      if (service.dependencies.includes('web')) {
        const controllerClassName = service.name
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('') + 'Controller';
          
        archive.append(
          generateSampleController(service),
          { name: `${projectRoot}/src/main/${service.language === 'kotlin' ? 'kotlin' : service.language}/${packagePath}/controller/${controllerClassName}${fileExt}` }
        );
      }

      // Finalize the zip
      archive.finalize();

    } catch (error) {
      reject(error);
    }
  });
};

// Generate a ZIP containing all microservices
export const generateAllProjectsZip = async (services: Service[]): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      const buffers: Buffer[] = [];
      archive.on('data', (data) => buffers.push(data));
      archive.on('end', () => resolve(Buffer.concat(buffers)));
      archive.on('error', (err) => reject(err));

      // Generate each service ZIP and add it to the main archive
      for (const service of services) {
        const serviceZip = await generateProjectZip(service);
        archive.append(serviceZip, { name: `${service.name}.zip` });
      }

      // Finalize the zip
      archive.finalize();

    } catch (error) {
      reject(error);
    }
  });
};
