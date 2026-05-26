# DIA TRENDZ ERP - ENTERPRISE DEPLOYMENT MANUAL
## Migrating to Frontend: Angular 18+ | Backend: Java Spring Boot | Database: PostgreSQL / Relational DB

You asked to change the tech stacks to **Angular** (frontend) and **Java with a suitable SQL Database** (backend) for your real-world production deployment. This manual provides direct step-by-step instructions to boot, verify, configure, and launch this high-end enterprise system!

---

## 📂 Architecture Overview

The system is fully decoupled into two enterprise-grade modules added cleanly to your workspace:

1.  **`/backend-java`**: Maven-based **Spring Boot 3.x REST API** using Java 17+.
    *   **Controller Layer**: Implements RESTful mappings (`/api/auth`, `/api/employees`, `/api/tasks`, `/api/leave`, `/api/metrics`, `/api/history`, `/api/logs`).
    *   **Service & Repository Layer**: Utilizes Spring Data JPA to execute transaction-safe database lookups.
    *   **Auto-Seeding Engine**: Pre-populates your database with default specialists (goldsmiths, QC, supervisors) and job cards automatically on first boot!
    *   **Cross-Origin Configuration**: Integrated with fine-tuned CORS filters to communicate with the client seamlessly.
2.  **`/frontend-angular`**: Modern standalone **Angular 18+ client application**.
    *   **State Managers**: Controls active work sessions, timers, audit event logs, and whitelisted system login domains.
    *   **Services Module**: Employs Angular's standard `HttpClient` with RxJS observables mapping REST endpoints.
    *   **WorkReports Component**: Features Month/Specialist search parameters and professional-grade PDF compiling using standard `jsPDF` and `html2canvas` without watermark overlays!

---

## 🛠 Prerequisites

Ensure the following tools are present in your target deployment environment:
*   **Java Development Kit (JDK) 17 or 21**
*   **Apache Maven 3.8+**
*   **Node.js 18+ & npm 9+**
*   **PostgreSQL Server 14+** (integrated; also supports instant H2 local in-memory fallback)

---

## 🚀 Step 1: Running the Java Spring Boot REST API Backend

1.  Open your server terminal and navigate to the backend folder:
    ```bash
    cd backend-java
    ```
2.  **(Optional) Configure PostgreSQL Database Parameters**:
    By default, Spring Boot will attempt to connect to a local database named `diatrendz` on port 5432 using standard credentials. You can customize this directly in `src/main/resources/application.properties` or load them dynamically as environment variables:
    ```bash
    export SPRING_DATASOURCE_URL=jdbc:postgresql://your-cloud-database-host:5432/diatrendz
    export SPRING_DATASOURCE_USERNAME=your_secured_username
    export SPRING_DATASOURCE_PASSWORD=your_secured_password
    ```
3.  **Compile & Package the Backend JAR**:
    ```bash
    mvn clean package -DskipTests
    ```
4.  **Launch the Spring Boot Server**:
    The system will initialize, build the relational schemas inside PostgreSQL, seed the default dataset, and bind the REST endpoints on port `8080`!
    ```bash
    java -jar target/erp-0.0.1-SNAPSHOT.jar
    ```

---

## 🎨 Step 2: Running the Angular 18+ Frontend Client

1.  Open a separate terminal window and navigate to the frontend folder:
    ```bash
    cd frontend-angular
    ```
2.  **Install Frontend Node Dependencies**:
    Includes compiler CLI, standalone reactive form bindings, and PDF layout rendering packages:
    ```bash
    npm install
    ```
3.  **Launch the Angular Local Dev Server**:
    This maps your tailwind style declarations and hosts the luxury UI on port `4200` automatically:
    ```bash
    npm start
    ```
4.  **Compile production files** (when deploying to webservers like Nginx):
    Produces standalone minified static bundles in `/dist/dia-trendz-erp` designed to serve globally at high speeds:
    ```bash
    npm run build
    ```

---

## 🔒 Security & Domain Whitelisting Controls

To enroll a specialist or sign in, the system uses strict whitelist verification:
1.  Sign in as the **SuperAdmin** (`admin@gmail.com` with code `Admin@123`).
2.  Open the **Domain Registry Settings** at the upper right.
3.  Register any official company email domains (e.g. `@diatrendz.com`, `@dia.com`).
4.  You can easily manage, delete, or flag default domains dynamically inside the modal.

---

## 📝 SQL Schema Reference (Generated Automatically by JPA Hibernate)

If your database administrator requires manual DDL schema definitions, the system matches these relational tables:
*   `users`: Stores active credentials, specialties, and computed productivity ratios.
*   `job_cards`: Tracks diamond details, gold weights, and active timeline events.
*   `leave_requests`: Manages employee leave balances and approved shift interruptions.
*   `audit_logs`: Registers immutable timestamps for supervisor reviews.
*   `email_domains`: Holds standard email login options.
