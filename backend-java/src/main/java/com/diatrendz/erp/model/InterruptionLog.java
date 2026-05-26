package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_card_interruptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterruptionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "paused_at", length = 64)
    private String pausedAt;

    @Lob
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 0;
}
