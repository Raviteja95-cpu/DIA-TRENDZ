package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_card_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "status", length = 64)
    private String status;

    @Column(name = "timestamp", length = 64)
    private String timestamp;

    @Column(name = "payload", length = 255)
    private String payload;

    @Column(name = "user_name", length = 120)
    private String user;
}
