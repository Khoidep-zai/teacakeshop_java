# =========================
# STAGE 1: BUILD FRONTEND
# =========================

FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# =========================
# STAGE 2: BUILD BACKEND
# =========================

FROM maven:3.9-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src
COPY --from=frontend-build /frontend/dist ./frontend/dist

# Maven copies frontend/dist into src/main/resources/static
RUN mvn clean package -DskipTests -B


# =========================
# STAGE 3: RUN APPLICATION
# =========================

FROM eclipse-temurin:21-jre

WORKDIR /app

RUN useradd --system --uid 10001 appuser

COPY --from=backend-build /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
