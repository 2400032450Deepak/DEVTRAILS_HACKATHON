FROM azul/zulu-openjdk-alpine:17

WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/devtrails-backend-0.0.1-SNAPSHOT.jar"]
