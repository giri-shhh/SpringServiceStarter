export interface Dependency {
  id: string;
  name: string;
  description: string;
}

export interface DependencyGroup {
  name: string;
  dependencies: Dependency[];
}

// Define all spring boot dependencies grouped by category
export const allDependencies: DependencyGroup[] = [
  {
    name: "Web",
    dependencies: [
      {
        id: "web",
        name: "Spring Web",
        description: "Build web applications using Spring MVC"
      },
      {
        id: "webflux",
        name: "Spring Reactive Web",
        description: "Build reactive web applications with Spring WebFlux"
      },
      {
        id: "graphql",
        name: "Spring GraphQL",
        description: "Build GraphQL applications with Spring for GraphQL"
      },
      {
        id: "websocket",
        name: "WebSocket",
        description: "Build WebSocket applications with SockJS and STOMP"
      },
      {
        id: "hateoas",
        name: "Spring HATEOAS",
        description: "Build hypermedia-driven REST web services"
      }
    ]
  },
  {
    name: "SQL",
    dependencies: [
      {
        id: "data-jpa",
        name: "Spring Data JPA",
        description: "Persist data in SQL stores with Java Persistence API"
      },
      {
        id: "mysql",
        name: "MySQL Driver",
        description: "MySQL JDBC driver"
      },
      {
        id: "postgresql",
        name: "PostgreSQL Driver",
        description: "PostgreSQL JDBC driver"
      },
      {
        id: "h2",
        name: "H2 Database",
        description: "H2 database (with embedded support)"
      },
      {
        id: "liquibase",
        name: "Liquibase Migration",
        description: "Liquibase database migration and version control"
      }
    ]
  },
  {
    name: "NoSQL",
    dependencies: [
      {
        id: "data-mongodb",
        name: "Spring Data MongoDB",
        description: "Store data in MongoDB document database"
      },
      {
        id: "data-redis",
        name: "Spring Data Redis",
        description: "Access Redis key-value data stores"
      },
      {
        id: "data-elasticsearch",
        name: "Spring Data Elasticsearch",
        description: "Store and search data with Elasticsearch"
      },
      {
        id: "data-cassandra",
        name: "Spring Data Cassandra",
        description: "Access Cassandra distributed database"
      }
    ]
  },
  {
    name: "Cloud",
    dependencies: [
      {
        id: "eureka",
        name: "Eureka Discovery Client",
        description: "Client that connects to Eureka for service discovery"
      },
      {
        id: "config-client",
        name: "Config Client",
        description: "Client for Spring Cloud Config Server"
      },
      {
        id: "gateway",
        name: "Gateway",
        description: "Provides routing and filtering capabilities"
      },
      {
        id: "config-server",
        name: "Config Server",
        description: "Central configuration server for distributed systems"
      },
      {
        id: "eureka-server",
        name: "Eureka Server",
        description: "Registry server for service discovery"
      }
    ]
  },
  {
    name: "Messaging",
    dependencies: [
      {
        id: "kafka",
        name: "Spring for Apache Kafka",
        description: "Publish and subscribe to Apache Kafka topics"
      },
      {
        id: "amqp",
        name: "Spring for RabbitMQ",
        description: "Message broker using the Advanced Message Queuing Protocol"
      },
      {
        id: "websocket",
        name: "WebSocket",
        description: "Build WebSocket applications with SockJS and STOMP"
      }
    ]
  },
  {
    name: "Security",
    dependencies: [
      {
        id: "security",
        name: "Spring Security",
        description: "Highly customizable authentication and access-control"
      },
      {
        id: "oauth2-client",
        name: "OAuth2 Client",
        description: "OAuth2/OpenID Connect client features"
      },
      {
        id: "oauth2-resource-server",
        name: "OAuth2 Resource Server",
        description: "OAuth2 resource server features"
      }
    ]
  },
  {
    name: "Observability",
    dependencies: [
      {
        id: "actuator",
        name: "Spring Boot Actuator",
        description: "Supports built-in or custom endpoints for monitoring and management"
      },
      {
        id: "prometheus",
        name: "Prometheus",
        description: "Expose metrics in Prometheus format"
      },
      {
        id: "zipkin",
        name: "Zipkin Client",
        description: "Report trace data to Zipkin"
      }
    ]
  },
  {
    name: "Testing",
    dependencies: [
      {
        id: "test",
        name: "Spring Boot Test",
        description: "Testing utility with JUnit Jupiter, Hamcrest and Mockito"
      },
      {
        id: "testcontainers",
        name: "Testcontainers",
        description: "Provide lightweight, throwaway instances of databases, message brokers, etc."
      }
    ]
  }
];
