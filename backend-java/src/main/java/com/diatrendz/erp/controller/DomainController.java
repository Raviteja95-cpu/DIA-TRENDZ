package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.EmailDomain;
import com.diatrendz.erp.repository.EmailDomainRepository;
import com.diatrendz.erp.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/domains")
@CrossOrigin(origins = "*")
public class DomainController {

    @Autowired
    private EmailDomainRepository emailDomainRepository;

    @Autowired
    private ErpService erpService;

    @GetMapping
    public ResponseEntity<List<EmailDomain>> getAllDomains() {
        return ResponseEntity.ok(emailDomainRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addDomain(@RequestBody Map<String, Object> payload) {
        String domain = (String) payload.get("domain");
        Boolean isDefault = (Boolean) payload.get("isDefault");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        if (domain == null || !domain.startsWith("@")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Domain name must start with @ (e.g., @diatrendz.com)"));
        }

        Optional<EmailDomain> existing = emailDomainRepository.findByDomainIgnoreCase(domain);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "This email domain is already registered."));
        }

        EmailDomain newDomain = EmailDomain.builder()
                .id("DOM-" + System.currentTimeMillis())
                .domain(domain.trim())
                .isDefault(isDefault != null && isDefault)
                .build();

        if (Boolean.TRUE.equals(newDomain.getIsDefault())) {
            List<EmailDomain> all = emailDomainRepository.findAll();
            all.forEach(d -> d.setIsDefault(false));
            emailDomainRepository.saveAll(all);
        }

        emailDomainRepository.save(newDomain);
        erpService.addAuditLog(userId, userName, userRole, "Add Domain", "Added official domain " + domain);

        return ResponseEntity.ok(Map.of("success", true, "domains", emailDomainRepository.findAll()));
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteDomain(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<EmailDomain> domainOpt = emailDomainRepository.findById(id);
        if (domainOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Domain not found"));
        }

        EmailDomain domainObj = domainOpt.get();
        if (Boolean.TRUE.equals(domainObj.getIsDefault())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cannot delete default domain. Mark another domain as default first."));
        }

        emailDomainRepository.delete(domainObj);
        erpService.addAuditLog(userId, userName, userRole, "Delete Domain", "Deleted company domain '" + domainObj.getDomain() + "'");

        return ResponseEntity.ok(Map.of("success", true, "domains", emailDomainRepository.findAll()));
    }

    @PostMapping("/default")
    public ResponseEntity<?> setDefaultDomain(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<EmailDomain> domainOpt = emailDomainRepository.findById(id);
        if (domainOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Domain not found"));
        }

        List<EmailDomain> all = emailDomainRepository.findAll();
        all.forEach(d -> d.setIsDefault(d.getId().equals(id)));
        emailDomainRepository.saveAll(all);

        EmailDomain domainObj = domainOpt.get();
        erpService.addAuditLog(userId, userName, userRole, "Default Domain", "Set '" + domainObj.getDomain() + "' as the default login domain");

        return ResponseEntity.ok(Map.of("success", true, "domains", emailDomainRepository.findAll()));
    }
}
