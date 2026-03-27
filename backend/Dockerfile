# backend/Dockerfile
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# FIX: Bind to 0.0.0.0 and use PORT from Render
CMD ["sh", "-c", "java -jar -Dserver.address=0.0.0.0 -Dserver.port=${PORT:-8080} app.jar"]
