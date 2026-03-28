FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
# Copy pom.xml from the backend folder (since build context is root)
COPY backend/pom.xml .
RUN mvn dependency:go-offline
# Copy source code from backend/src
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
COPY --from=build /app/target/*.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
