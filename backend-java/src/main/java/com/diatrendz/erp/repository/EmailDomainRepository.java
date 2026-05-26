package com.diatrendz.erp.repository;

import com.diatrendz.erp.model.EmailDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailDomainRepository extends JpaRepository<EmailDomain, String> {
    Optional<EmailDomain> findByDomainIgnoreCase(String domain);
}
