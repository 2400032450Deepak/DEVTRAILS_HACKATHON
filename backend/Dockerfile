FROM openjdk:17-alpine

WORKDIR /app

# Copy only needed files first (better caching)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

EXPOSE 8080
CMD ["sh", "-c", "java -jar target/*.jar"]
