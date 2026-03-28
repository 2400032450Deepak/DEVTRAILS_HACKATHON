FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app
# Copy the entire backend folder contents to /app
COPY backend/ .
# Run Maven build
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
