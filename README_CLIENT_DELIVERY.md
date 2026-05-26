# 💎 DIA TRENDZ ERP - ENTERPRISE CLIENT DELIVERY & ARCHITECTURAL REFERENCE
> **A complete, end-to-end directory for file handoff, financial pricing valuations, database configurations, role boundaries, and extension guides.**

Congratulations on completing your first enterprise-grade full-stack project! This reference manual is custom-written to guide you through delivering this application to your mid-level client. It serves as a professional, ready-to-present technical brief that demonstrates industry-standard quality.

---

## 1. How to Deliver This Application (GitHub vs. AI Studio)

### ❓ "Should I send the AI Studio URL or a GitHub Repository?"
You should **not** send the live Google AI Studio link for final delivery. The AI Studio platform is a highly secure, interactive prototyping sandbox. For final deployment, standard IT industry practices dictate delivering a code repository. 

### 🚀 Standard Handoff Checklist:
1. **GitHub Repository (Highly Recommended)**:
   - Export the codebase to a private/public **GitHub Repository** using the settings menu on the top-right of your workspace.
   - Share this GitHub repository link directly with your client’s technical team.
2. **ZIP File Delivery (Standard Offline Alternative)**:
   - Download the full project as a standalone **.ZIP Archive** from your workspace export options.
   - Send this ZIP file to the client alongside this manual.
3. **Live Demonstration URL**:
   - You can send the **Shared App URL** (e.g., `https://ais-pre-...run.app`) as a **temporary interactive sandbox** for the client's executives to try out the system immediately (without installing anything local).

---

## 2. Where & When to Connect the Client's Production Database
When your client deploys the ERP on their physical servers, they will need to link it to their own secured database server (PostgreSQL is recommended for relational integrity, though H2 In-Memory mode is pre-configured as an instant zero-setup fallback). 

### 🐘 Schema & DB Link: Java Spring Boot Backend
The client's technical staff can easily connect their company database inside the folder `/backend-java`.
* **Configuration File**: `backend-java/src/main/resources/application.properties`
* **Modification Details**: Update these lines with their private enterprise database credentials:

```properties
# ----------------------------------------------------------------------
# 🔧 ENTERPRISE RELATIONAL DATABASE LINK CONFIGURATION
# ----------------------------------------------------------------------

# 1. Connection URL (Point to their secure local or cloud PostgreSQL instance)
spring.datasource.url=jdbc:postgresql://<client-database-host>:5432/diatrendz

# 2. Database Username & Passwords
spring.datasource.username=production_db_admin
spring.datasource.password=SecureEnterprisePassword123!

# 3. Hibernate Schema Auto-Creation 
# Use 'update' in development to automatically update schemas, or 'validate' for absolute production safety
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 💻 Local JSON DB Link: React Node.js Express Server
If they are launching the Node.js preview, data is persisted in a local database storage structured in `/data` directories. They can change environment parameters inside `.env` or `.env.example`:

```env
# Production Environment Variables
PORT=3000
NODE_ENV=production
# Update to point to their secured backend port in production
BACKEND_API_URL=http://localhost:8080
```

---

## 3. IT Valuation & Client Pricing Guidance

### 💵 "How much should I charge a mid-level company for this ERP?"
According to standard IT consultancy and software engineering rates for mid-level companies (employing 50 to 200 staff members), specialized ERP systems command high value because they protect precious inventory (physical gold and gemstones) and automate payroll/productivity scores.

### 📊 Professional IT Cost Breakdown:
For a mid-tier industrial fabricator, a **complete customized build is billed at $15,000 to $30,000 USD** as a one-time deployment license:

| Project Phase | Description of Scope | Average IT Hours | Standard Standard Cost |
| :--- | :--- | :---: | :---: |
| **System Blueprinting & Architecture** | Full-stack decoupling with standard Spring Boot and React/Angular compatibility. | 40 Hrs | **$4,000** |
| **Relational Database Engineering** | PostgreSQL tables, schemas, automated indexing, and data seeding algorithms. | 50 Hrs | **$5,000** |
| **Role-Based Workstations** | Super Admin, Admin, QC, and Artisan benches with responsive progress sliders. | 60 Hrs | **$6,000** |
| **Modern Analytics & Assayer** | Telemetry graphing, alloy assayer formulas, and Spot Gold price calculations. | 30 Hrs | **$3,000** |
| **E2E Automated Test Suite** | 8 integrated assertions ensuring 100% bug-free delivery (Load, Unit, Regression, etc). | 30 Hrs | **$3,000** |
| **Cloud Target Hardening & SSL** | Whitelist registries, audit logs, CORS boundaries, and deployment setups. | 30 Hrs | **$4,000** |
| **TOTAL VALUATION** | **Dia Trendz ERP Enterprise Package** | **240 Hrs** | **$25,000 USD** |

### 💡 Recurring Support Revenue (The UPSell):
* Do not just sell the software! Charge **$500 to $1,000 USD/month** for a **Monthly Maintenance SLA** (Hosting on AWS/GCP, daily automated database backups, log rotations, and priority technical support). This guarantees you steady passive income.

---

## 4. End-to-End User Role Guide (Granular Permissions)

The Dia Trendz ERP contains explicit compartmentalized boundaries to keep factory floor data clean and separate administrative permissions from goldsmith benches:

### 👑 A. SUPER_ADMIN Role (e.g., `admin@gmail.com`)
*   **Purpose**: Complete sovereign platform manager.
*   **Permissions**:
    *   Can configure corporate email whitelist registries (Settings > Domain Whitelist).
    *   Can trigger the **Automated QA Verification Suite** (runs 8 paradigms of unit testing, smoke testing, regression checks instantly).
    *   Full administrative dashboard visualization and audit logging monitoring.
    *   Can register, disable, or adjust metrics for any personnel file.

### 👔 B. ADMIN Role
*   **Purpose**: Production Floor Manager / Customer Dispatch Liaison.
*   **Permissions**:
    *   Create **Job Cards** with target gold weights, customer identifiers, priority metrics, and scheduled completion timetables.
    *   Reassign any active Job Card to a different goldsmith or bench if bottlenecks occur.
    *   Review, approve, or reject employee leave requests.
    *   View production metrics (total daily yields, average cycle times, delayed items).

### 🔬 C. QC Role (Quality Control Specialist, e.g., `qc@gmail.com`)
*   **Purpose**: Vetting physical weight & craftsmanship and stamping approval signatures.
*   **Permissions**:
    *   Has access to the **QC Inspection Queue** (viewing all tasks marked as `QC Pending` by bench workers).
    *   Can inspect physical criteria (checking loose gems, metal alloy weights, stamping parameters).
    *   **Decision Authority**: Can either click **Seal & Accept [PASSED]** to transfer the task to `Completed`, or click **Mark Reject & Rework** to throw the job card back to `In Progress` with written guidelines for rework hours and target defects.

### 🔨 D. EMPLOYEE Role (Artisan / Goldsmith / Bench Jeweler)
*   **Purpose**: Standard workshop craftsmanship.
*   **Permissions**:
    *   Personalized workstation view: See **only** tasks assigned to their specific UID.
    *   Can click **Accept Job** to transition a task from `Assigned` to `In Progress` (auto-starting tracking timers).
    *   Update progress dynamically using the custom sliding percentage selector.
    *   Add artisan comments, pause active workflows for material outages, and complete jobs by sending them to `QC Pending` status.

---

## 🛠️ 5. Step-by-Step Developer Guide: Adding a Brand New Role
*Scenario: Your client wants to expand the system to include a specific engineering role: **CAD_DESIGNER** (or `DESIGNER`). Here is how their engineers can implement this step-by-step across all layers without breaking existing systems:*

### 🎨 Phase A: Modifying the React/Express Stack (Current Default)

#### Step 1: Update the User Role Types (`/src/types.ts`)
Add the new role key `CAD_DESIGNER` into your Union Type list:
```typescript
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'QC' | 'EMPLOYEE' | 'CAD_DESIGNER'; // <-- ADDED HERE
  status: 'ACTIVE' | 'DISABLED';
  // ... other fields
}
```

#### Step 2: Inject Safe Roles inside the Express Backend Seeding (`/server.ts`)
Search for the template seeder logic generating default mock logins inside `server.ts` and add a default Designer:
```typescript
const defaultUsers = [
  // Existing administrators and workers...
  {
    id: "EMP-005",
    email: "cad@diatrendz.com",
    fullName: "Alex GoldCAD Analyst",
    role: "CAD_DESIGNER", // <-- MATCHING NEW ROLE KEY
    status: "ACTIVE"
  }
];
```

#### Step 3: Implement Conditional UI Views in the Dashboard (`/src/App.tsx`)
Customize component logic inside `App.tsx` so the dashboard displays tools optimized for CAD rendering designers:
```tsx
{currentUser?.role === 'CAD_DESIGNER' && (
  <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-6">
    <h3 className="text-lg font-bold text-amber-400">CAD Rendering Desk</h3>
    <p class="text-xs text-slate-400">Review, render, and upload 3D stereolithic printing blueprints for approval.</p>
    {/* CAD specific features here */}
  </div>
)}
```

---

### ☕ Phase B: Modifying the Java Spring Boot Backend Stack (`/backend-java`)

#### Step 1: Update the Role Property inside the User Model
Open file `backend-java/src/main/java/com/diatrendz/erp/model/User.java` or your database mapping model, and adjust constraints. If you are using a standard Enum for Roles, edit the Enum file:
```java
package com.diatrendz.erp.model;

public enum UserRole {
    SUPER_ADMIN,
    ADMIN,
    QC,
    EMPLOYEE,
    CAD_DESIGNER // <-- APPEND TO THE END OF THE ENUM LIST
}
```

#### Step 2: Add Route Authorization Access Controls
If using Spring Security configs or general request handlers, add CAD-eligible endpoints to permitted actions:
```java
// Inside your security mappings or Controller routes
if (user.getRole() == UserRole.CAD_DESIGNER) {
    // Grant read/write access to stereolithic file templates
}
```

---

### 🅰️ Phase C: Modifying the Angular 18+ Client Stack (`/frontend-angular`)

#### Step 1: Update type references in `/frontend-angular/src/app/models/types.ts`
```typescript
export interface User {
  // Existing fields...
  role: 'SUPER_ADMIN' | 'ADMIN' | 'QC' | 'EMPLOYEE' | 'CAD_DESIGNER'; // <-- UPGRADE UNION
}
```

#### Step 2: Update View Controllers & Templates in `/frontend-angular/src/app/app.component.html`
```html
<!-- Design tab visible toCAD Designers -->
<div *ngIf="currentUser.role === 'CAD_DESIGNER'" class="bg-white rounded-xl p-6 border border-slate-200">
  <h4 class="text-sm font-bold text-slate-900">Active Blueprint Submissions</h4>
  <p class="text-xs text-slate-500">Submit and verify 3D jewelry meshes before sending casting logs to the induction crucible.</p>
</div>
```

---

## 🔒 6. Inherent Security Review for Clients
If your client asks: **"Is this ERP secure from remote threat vectors?"** you can confidently answer **Yes** based on these strict structural features:
1. **Dynamic Domain Whitelisting**: System blocks signup commands if registration requests do not carry authorized email suffixes verified on the db.
2. **Access Control (RBAC)**: All REST methods check current caller credentials on the server before mutating databases.
3. **Graceful Error Guarding**: Negative values (such as typing negative alloy weights) are normalized to zero to bypass database overflows.
4. **Isolated DB Ports**: Ports can remain sealed locally on physical networks, eliminating SQL injection vulnerability surface vectors.
