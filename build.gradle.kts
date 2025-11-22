plugins {
    id("java")
    id("org.springframework.boot") version "3.2.0"  // Add Spring Boot plugin
    id("io.spring.dependency-management") version "1.1.4"  // Manages dependencies
}

group = "team.lebron"
version = "1.0-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17  // Spring Boot 3.x requires Java 17+
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf") // Optional: if you want server-side templates
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    
    // Database
    runtimeOnly("com.h2database:h2")
    
    // Password hashing
    implementation("org.springframework.security:spring-security-crypto:6.2.0")
    
    // Development tools (optional but helpful)
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    
    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}