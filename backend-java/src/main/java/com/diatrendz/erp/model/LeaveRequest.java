package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @Column(name = "id", length = 32)
    private String id; // e.g. "LEV-501"

    @Column(name = "employee_id", length = 32, nullable = false)
    private String employeeId;

    @Column(name = "employee_name", length = 120, nullable = false)
    private String employeeName;

    @Column(name = "leave_type", length = 32, nullable = false)
    private String leaveType; // vacation, emergency, sick, maternal, paternal, bereavement

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Lob
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "created_at", length = 64)
    private String createdAt;

    @Lob
    @Column(name = "admin_remarks", columnDefinition = "TEXT")
    private String adminRemarks;
}
