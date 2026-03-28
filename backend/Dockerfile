FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY backend/pom.xml /app/
RUN mvn dependency:go-offline
COPY backend/src /app/src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
COPY --from=build /app/target/*.jar /app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
