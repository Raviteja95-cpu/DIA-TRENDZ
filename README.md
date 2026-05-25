# Dia Trendz | Premium Jewelry Production Custody Tracking & Floor Management Suite
### Enterprise Manufacturing Execution System (MES) & Laboratory Operations Topographies

---

## 1. Architectural System Overview

This repository houses the front-end codebase for the **Dia Trendz Manufacturing Execution System (MES)**. It is engineered to orchestrate and track high-value jewelry production custody, precision laboratory throughput, and floor personnel operations through a high-fidelity visual interface. 

The system leverages a deterministic state machine to trace physical **Job Bags** through eight sequential manufacturing nodes:

$$\text{Designing Desk} \longrightarrow \text{High-Precision CAD} \longrightarrow \text{Induction Alloy Crucible} \longrightarrow \text{Gemstone Allocation} \longrightarrow \text{Master Stone Bench} \longrightarrow \text{Mirror Polishing & Wet-Lab} \longrightarrow \text{Hallmark QC Spectroscopy} \longrightarrow \text{High-Security Logistics Vault}$$

---

## 2. Granular Technology Stack & Pipeline Spec

The application architecture has been decoupled from legacy paradigms, migrating into a modern high-performance SPA structure.

| Layer | Technology Spec | Purpose / Core Implementation |
| :--- | :--- | :--- |
| **Compiler & Bundler** | Vite 5.x / TypeScript 5.x | Fast-refresh scaffolding, tree-shaking compiler profiles, and static asset minification matrices. |
| **View Layer** | React 18.x (Functional Hooks) | Pure declarative component cycles utilizing virtual DOM reconciliation algorithms. |
| **State Propagation** | React Hook-driven Hub | Client-side reactive memory pools tracking material counts, personnel status, and telemetry streams. |
| **Design Language** | Tailwind CSS v4 | Class utility compiles, relative styling matrices, responsive breakpoints, and custom layout frameworks. |
| **Color Ambiance** | High-Contrast Royal Navy Space | Styled within `#04091a` to `#162447` gamuts using background linear gradients to maximize high-contrast optical clarity on shop-floor tablets. |
| **Iconography Layer** | Lucide Vector Assets (`lucide-react`) | Static SVG mapping coordinates guaranteeing sharp rendering ratios across retina screens. |
| **Telemetry Analytics** | D3-Engine & Recharts Components | Dynamic SVG calculation layers processing multi-dimensional factory metrics on live coordinates. |

---

## 3. High-Fidelity Modules Implemented

### A. Spot Precision Job Bag Locator (`/src/components/JobBagTracker.tsx`)
A state-monitored directory to locate and audit high-value production envelopes.
- **Physical Barcode Engine Simulation**: Evaluates exact, dry metal weights (e.g., 24K Yellow Gold, 18k Platinum) and matches inputs instantly using substring/exact search parameters.
- **Status Matrix Verifier**: Every searched Job Bag produces an operational state layout comparing the 8 key departments. Each checkpoint contains distinct visual signals mapping to **Started/Completed**, **In Progress (Active)**, or **Not Started Yet**.
- **Dual-Custodian Timeline Handoff Logs**: Tracks chain of custody sequentially, verifying historical timestamps, payloads, and individual artisans.

### B. High-Contrast Ambiance & Layout Structure
- Modified global variables and overriding selectors inside `/src/index.css`.
- Replaced basic dark canvas styling with a rich Space Royal Navy palette (`#04091a`, `#0b152d`, `#1f3460`).
- Implemented fluid grid dimensions (`w-full max-w-7xl mx-auto`) with typography utilizing display-optimized fonts (*Plus Jakarta Sans* and *Playfair Display* headings matched alongside *JetBrains Mono* for analytical tracking numbers).

### C. Analytical Dashboard & Personnel Scheduling Nodes
- Integrated dynamic personnel metrics tracking individual jewel-smiths, sorting operators, and casting leads.
- Fully functional filter controllers mapping active task statuses, material allocations, and active repair requisitions.

---

## 4. Automated QA Verification Suite & Test Engine Operations

The system features an integrated corporate **Multi-Layer Quality Assurance Verification Suite** located at `GET /api/tests/run` and visually represented on the **Testing Center Dashboard** (accessible to `SUPER_ADMIN` role).

This testing suite runs in-memory system assertions covering the eight critical software testing methodologies to maintain robust operations:

| Testing Paradigm | Verification Target | Core Implementation Detail |
| :--- | :--- | :--- |
| **1. Unit Testing** | Gold Purity formulas & vacation calculations | Asserts correct scalar multipliers for gold-karat ratios ($K/24$) and inclusive date ranges for leaves. |
| **2. Integration Testing** | Domain Whitelists & State Seeding Integrity | Validates that foreign email addresses are correctly blocked while official domains and initial admin seeding remain intact. |
| **3. API Testing** | System Probe Payloads & Authentication gateways | Simulates diagnostic output structures and authentication login response matrices for positive and negative paths. |
| **4. E2E Simulation** | Manufacturing Workbench Lifecycle Swapes | Traces a single Job Bag from initial assignment, transition to active progress, transfer to pending QC, through final completion. |
| **5. Load Testing** | Multi-Query Concurrent Stress Verification | Automatically simulates 100 concurrent persistence queries on the seed data database, confirming sub-millisecond execute latencies. |
| **6. Security Testing** | SQL Wildcard Escaping & Login Lockouts | Prevents injection characters (like single-ticks and dashes) from bypassing bounds, and locks out deactivated employee status profiles. |
| **7. Smoke Testing** | Local Persistence Directories Probe | Asserts absolute read/write accessibility of raw files under the local directory file system. |
| **8. Regression Testing** | Boundary Alloy Weights Integrity Gates | Enforces that physical material inputs handles negative outliers gracefully by overriding them to positive bounds of $0$. |

Developers can trigger automated sweeps programmatically:
```bash
curl http://localhost:3000/api/tests/run
```

---

## 5. Run-Time Development & Deployment Manual

### Prerequisites
Ensure your operating system is equipped with **Node.js LTS (v18.0.0+ or v20.0.0+)** and the standard package manager **npm (v9.0.0+)**.

```bash
node --version
npm --version
```

### Setup Sequence
Clone the compiled source repository and transition into the primary working directory:

```bash
# 1. Mount project workspace
cd dia-trendz-mes-suite

# 2. Extract and compile local node module trees
npm install
```

### Local Dev Server Run Loop
To initialize the hot-reloading dev loop on localhost (utilizing Vite middleware layers):

```bash
npm run dev
```
Open your local testing loop inside your network:
`http://localhost:3000` (or the fallback local host port output).

### Production Asset Compilation
To execute static analysis verification, compile JSX/TypeScript modules into binary assets, and output high-performance distribution paths:

```bash
npm run build
```
The optimized bundle compiles directly to `/dist`. This directory can be statically served by an Nginx, Apache, or AWS S3 cloud CDN wrapper.

### Local Mock Testing of Production Output
To serve the local build package via a local server to simulate production conditions:

```bash
npm run start
```

---

## 6. Architectural Directory Spec (For Engineers Only)

```yaml
/
├── server.ts             # Express core middleware server setup
├── package.json          # Node dependency configuration & compile rules
├── tsconfig.json         # TypeScript compiler configurations (strict: true)
├── vite.config.ts        # Vite build optimization rules and bundling targets
├── index.html            # Main SPA viewport entry wrapper
└── src/
    ├── main.tsx          # React application bootstrapping engine
    ├── App.tsx           # Global routing hub and primary page layouts
    ├── index.css         # Tailwind v4 directives and brand color overrides
    ├── types.ts          # Declarative TS Enums, interfaces, and metric models
    └── components/
        ├── JobBagTracker.tsx  # Dynamic envelope tracking and Status Matrix Module
        ├── QCModule.tsx       # Spectroscopy testing validation board
        ├── ModernAnalytics.tsx# Scaled graphs rendering factory workloads
        └── ...                # Supplemental system views & tables
```

---
*Document Class: Enterprise Software Architecture Specification Specification 12-B9.*
*Restricted Internal Distribution — Authorized Core Engineers Only.*
