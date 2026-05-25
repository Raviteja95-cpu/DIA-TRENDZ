# Dia Trendz | End-to-End Operational Manual
### Comprehensive Corporate Workflow and User Procedures Manual

---

## 1. System Overview

Dia Trendz is an enterprise Manufacturing Execution System (MES) designed specifically for jewelry design, gemstone setting, and fine metal casting laboratories. The system integrates real-time workbench updates, spot gold rate parameters, and quality control auditing loops.

```
                    +------------------------------------+
                    |  Administrative Management Module  |
                    | (Job Bags dispatching & personnel)  |
                    +------------------------------------+
                                       │
                                       ▼ (Dispatched to Artisan)
                    +------------------------------------+
                    |     Workstation Production HUD     |
                    | (Artisans accept & slide progress) |
                    +------------------------------------+
                                       │
                                       ▼ (Submitted for Inspection)
                    +------------------------------------+
                    |   Spectrometry & QC Assessment     |
                    | (QC Specialists audit and stamp)  |
                    +------------------------------------+
```

---

## 2. Setting Up the Initial Workspace

Before initiating operations, a system platform supervisor must configure the active workspace parameters:

1.  **System Entry**:
    *   Navigate to the gateway page.
    *   Sign in using the pre-seeded Super Administrative credential:
        *   **Email**: `admin@gmail.com`
        *   **Password**: `Admin@123`
2.  **Add Employees**:
    *   Open the mobile sidebar or desktop side navigation menu and select **Personnel**.
    *   Click **Register New Employee**.
    *   Complete the form fields (Full Name, Contact Email, Corporate Department, Initial Job Title, and Access Role).
    *   Click **Add Employee** to persist to disk.
3.  **Adjust Whitelists**:
    *   Go to **Settings** (Super Admin restricted).
    *   Navigate to **Permitted Corporate Email Domains**.
    *   Add a domain (e.g. `@diatrendz.com`) to enforce access boundaries for your workforce.

---

## 3. End-to-End Operational Workflow

Below is the standard, chronological manufacturing lifecycle for a single piece of jewelry (Job Bag):

```
+---------------+      +--------------+      +-----------------+      +----------------+      +---------------+
| Task Created  | ===> | Dispatched   | ===> | In-Work Sliders | ===> | QC Assessment  | ===> | Job Completed |
| (Admin level) |      | (Employee)   |      | (Artisan Lab)   |      | (QA Inspector) |      | (Record/Log)  |
+---------------+      +--------------+      +-----------------+      +----------------+      +---------------+
```

### Phase A: Task Creation & Design Spec (Administrative Level)
1.  Navigate to **Tasks / Jobs** section.
2.  Select **Create New Job Bag**.
3.  Fill out the physical structural requirements:
    *   **Customer Identifier**: e.g., "Tiffany & Co."
    *   **Noble Metal Specification**: Yellow Gold / Platinum / Rose Gold / White Gold.
    *   **Total Target Metal Weight**: e.g., `12.5` grams.
    *   **Base Karat Value**: 24K, 22K, 18K etc.
    *   **Priority Level**: Low, Medium, High, or Urgent.
    *   **Target Completion Milestone Date**: Project schedule timeline.
4.  Optionally assign the Job Bag directly to an active employee. If unassigned, the task enters the queue in `Unassigned` status.
5.  Click **Create Design Task**.

### Phase B: Workbench Production (Artisan Level)
1.  Sign in using an employee profile (e.g., `employee@gmail.com` / `Employee@123`).
2.  Artisans see the **Workstation Dashboard**, presenting only jobs assigned to them.
3.  **Accepting Work**:
    *   Identify a job in `Assigned` status.
    *   Click the **Accept Job** indicator. The status transitions immediately to `In Progress`.
4.  **Tracking Progress**:
    *   During setting or casting cycles, use the percentage range slider to update progress (e.g., set to 50% as casting completes).
    *   Add comments in the **Artisan Remarks** field.
5.  **Submitting to QC**:
    *   Once setting is completely finished, drag the progress slider to **100%**.
    *   Click **Submit for QC Inspection**. The system changes the status to `QC Pending` and transfers the bag to the Quality Assurance queue.

### Phase C: Spectrometry & QA Auditing (QC Inspector Level)
1.  Sign in under the Quality Control role (e.g., `qc@gmail.com` / `QC@123`).
2.  Select **QC Inspection** from the side menu.
3.  QC Operators see all jobs in `QC Pending` status.
4.  Select a Job Bag to open the **Quality Assessment Panel**:
    *   Conduct physical measurement Audits.
    *   Update the **Metal Valuation Multipliers** to review standard purity constraints.
    *   Identify defects (metal pitting, poor prong settings, loose gems) if any.
5.  **Rendering a Decision**:
    *   If any audit fails, write remediation comments and click **Mark Reject & Rework**. The job drops back to `In Progress` under the original Artisan.
    *   If audits pass, write passing remarks and click **Seal & Accept [PASSED]**. The job changes to `Completed`.

---

## 4. Analytical Tracking & Real-Time Tools

### A. Spot Metal Fluctuations & Assayer Hub
*   Access the **Modern Analytics** dashboard (available to Admin/Super Admin).
*   Review the **3D Interactive Matrix Laboratory Yield Projection**. Look at the curves to examine output, gold rate movements, and profit margin distributions.
*   **Rapid Alloy Assayer Tool** (found in the sidebar of Analytics):
    *   Enter weight in grams and select standard karat levels. The calculator instantly evaluates raw metal valuations based on real-time gold market spot pricing.

### B. Historical Job Explorer & Auditing
*   Open **Historical Search**.
*   Query any previous job by ID, Customer Name, or Alloy profile.
*   The system displays chronological transitions, enabling administrators to track which artisan performed each phase and who approved the final seals.

---

## 5. Staff Absence & Schedulers

1.  Navigate to **Leave Calendar**.
2.  Employees can request leave intervals.
3.  Administrators can review and approve/reject leave periods to ensure lab floor operations are balanced against upcoming delivery milestones.
