# =========================
# STAGE 1: BUILD BACKEND
# =========================

FROM maven:3.9-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests -B


# =========================
# STAGE 2: RUN APPLICATION
# =========================

FROM eclipse-temurin:21-jre

WORKDIR /app

RUN useradd --system --uid 10001 appuser

COPY --from=backend-build /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
