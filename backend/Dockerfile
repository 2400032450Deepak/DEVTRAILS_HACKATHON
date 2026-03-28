FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
# Copy the entire backend folder contents to /app
COPY backend/ .
# Run Maven build
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
