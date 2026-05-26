package com.diatrendz.erp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "email_domains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailDomain {

    @Id
    @Column(name = "id", length = 32)
    private String id; // e.g. "DOM-1"

    @Column(name = "domain", unique = true, nullable = false, length = 64)
    private String domain; // e.g. "@diatrendz.com"

    @Column(name = "is_default")
    private Boolean isDefault;
}
