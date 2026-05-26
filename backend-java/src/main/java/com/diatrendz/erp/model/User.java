package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "id", length = 32)
    private String id; // e.g. EMP-101, SuperAdmin secure unique prefix

    @Column(name = "email", unique = true, nullable = false, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 120)
    private String passwordHash; // raw string match 'Admin@123' as per current spec requirements

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "role", nullable = false, length = 32)
    private String role; // SUPER_ADMIN, ADMIN, QC, EMPLOYEE

    @Column(name = "phone", length = 32)
    private String phone;

    @Lob
    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage; // Base64 or standard asset url

    @Column(name = "department", length = 64)
    private String department; // Polishing, Setting, Casting, QC, etc.

    @Column(name = "specialization", length = 120)
    private String specialization;

    @Column(name = "skill_level", length = 32)
    private String skillLevel; // Intermediate, Expert, Master

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE, DISABLED

    @Column(name = "leave_status", nullable = false, length = 32)
    private String leaveStatus; // ACTIVE, ON_LEAVE

    @Column(name = "productivity_score")
    private Integer productivityScore; // 0 to 100 metric representation

    @Column(name = "leave_balance")
    private Integer leaveBalance; // remaining emergency vacation days

    @Column(name = "joining_date")
    private LocalDate joiningDate;
}
