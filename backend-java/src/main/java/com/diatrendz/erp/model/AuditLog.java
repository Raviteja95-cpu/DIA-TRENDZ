package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(name = "id", length = 64)
    private String id; // e.g. "LOG-1701234567"

    @Column(name = "timestamp", length = 64, nullable = false)
    private String timestamp;

    @Column(name = "user_id", length = 32)
    private String userId;

    @Column(name = "user_name", length = 120)
    private String userName;

    @Column(name = "user_role", length = 32)
    private String userRole;

    @Column(name = "action", length = 120, nullable = false)
    private String action;

    @Lob
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}
