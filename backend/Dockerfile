# -------- BUILD STAGE --------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy everything
COPY . .

# Build jar
RUN mvn clean package -DskipTests


# -------- RUN STAGE --------
FROM eclipse-temurin:17-jdk-alpine

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render uses 8080)
EXPOSE 8080

# Run application
ENTRYPOINT ["java","-jar","/app.jar"]
