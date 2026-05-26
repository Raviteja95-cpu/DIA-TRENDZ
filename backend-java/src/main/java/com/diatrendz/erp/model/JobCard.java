package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCard {

    @Id
    @Column(name = "id", length = 32)
    private String id; // e.g. "JOB-1001"

    @Column(name = "task_id", length = 32)
    private String taskId; // e.g. "TSK-1001"

    @Column(name = "customer_name", length = 120, nullable = false)
    private String customerName;

    @Column(name = "jewelry_type", length = 64, nullable = false)
    private String jewelryType; // Ring, Necklace, Bracelet, etc.

    @Column(name = "complexity_level", length = 32)
    private String complexityLevel; // Premium, Medium, Complex, etc.

    @Column(name = "priority", length = 32)
    private String priority; // Urgent, High, Medium, Low

    @Column(name = "gold_weight", precision = 5, scale = 2)
    private Double goldWeight;

    @Column(name = "material_type", length = 64)
    private String materialType; // 18K Yellow Gold, Platinum 950, etc.

    @Column(name = "assigned_employee_id", length = 32)
    private String assignedEmployeeId;

    @Column(name = "assigned_employee_name", length = 120)
    private String assignedEmployeeName;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "estimated_time")
    private Double estimatedTime; // Fabrication estimate hours logged by artisan

    @Column(name = "approved_time")
    private Double approvedTime; // Hours formally verified by team lead administrator

    @Column(name = "actual_time")
    private Double actualTime; // Actual elapsed hours calculated from active loops

    @Column(name = "progress_percent")
    private Integer progressPercent;

    @Lob
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // Assigned, Accepted, Waiting Approval, Approved, In Progress, Paused, QC Pending, Completed, Rework, Cancelled

    @Lob
    @Column(name = "qc_remarks", columnDefinition = "TEXT")
    private String qcRemarks;

    @Lob
    @Column(name = "qc_defects", columnDefinition = "TEXT")
    private String qcDefects;

    @Column(name = "rework_hours")
    private Double reworkHours;

    @Column(name = "started_at", length = 64)
    private String startedAt;

    @Column(name = "last_resumed_at", length = 64)
    private String lastResumedAt;

    @Column(name = "total_worked_ms")
    private Long totalWorkedMs = 0L;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_card_images", joinColumns = @JoinColumn(name = "job_card_id"))
    @Column(name = "image_base64", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> workImages = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "job_card_id")
    @Builder.Default
    private List<InterruptionLog> interruptionLogs = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "job_card_id")
    @Builder.Default
    private List<TimelineEvent> timeline = new ArrayList<>();
}
