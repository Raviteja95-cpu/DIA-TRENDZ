package com.diatrendz.erp.service;

import com.diatrendz.erp.model.*;
import com.diatrendz.erp.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ErpService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EmailDomainRepository emailDomainRepository;

    @Transactional
    public void addAuditLog(String userId, String userName, String userRole, String action, String details) {
        AuditLog log = AuditLog.builder()
                .id("LOG-" + System.currentTimeMillis())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .userId(userId)
                .userName(userName)
                .userRole(userRole)
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @PostConstruct
    @Transactional
    public void seedDatabaseAndInitialize() {
        // Seeding database if no users exist
        if (userRepository.count() == 0) {
            // Seed Domains Registry
            EmailDomain dom1 = emailDomainRepository.save(EmailDomain.builder().id("DOM-1").domain("@diatrendz.com").isDefault(true).build());
            emailDomainRepository.save(EmailDomain.builder().id("DOM-2").domain("@dia.com").isDefault(false).build());
            emailDomainRepository.save(EmailDomain.builder().id("DOM-3").domain("@diatrendz.ae").isDefault(false).build());

            // Seed specialist artisans & team administrators roster
            userRepository.save(User.builder()
                    .id("EMP-001")
                    .email("admin@gmail.com")
                    .passwordHash("Admin@123")
                    .fullName("Dia Trendz SuperAdmin")
                    .role("SUPER_ADMIN")
                    .phone("+1 (555) 789-1001")
                    .profileImage("")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(100)
                    .leaveBalance(30)
                    .joiningDate(LocalDate.of(2025, 1, 10))
                    .build());

            userRepository.save(User.builder()
                    .id("EMP-002")
                    .email("lead@diatrendz.com")
                    .passwordHash("Admin@123")
                    .fullName("Sanjay Jha (Team Lead)")
                    .role("ADMIN")
                    .phone("+91 98765 43210")
                    .profileImage("")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(95)
                    .leaveBalance(24)
                    .joiningDate(LocalDate.of(2025, 2, 15))
                    .build());

            userRepository.save(User.builder()
                    .id("EMP-101")
                    .email("rajesh@diatrendz.com")
                    .passwordHash("Admin@123")
                    .fullName("Rajesh Kumar")
                    .role("EMPLOYEE")
                    .phone("+91 91234 56789")
                    .profileImage("")
                    .department("Polishing")
                    .specialization("Solitaire Rings")
                    .skillLevel("Expert")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(92)
                    .leaveBalance(12)
                    .joiningDate(LocalDate.of(2025, 3, 1))
                    .build());

            userRepository.save(User.builder()
                    .id("EMP-102")
                    .email("deepa@diatrendz.com")
                    .passwordHash("Admin@123")
                    .fullName("Deepa Patel")
                    .role("EMPLOYEE")
                    .phone("+91 99887 76655")
                    .profileImage("")
                    .department("Setting")
                    .specialization("Luxury Necklaces")
                    .skillLevel("Master")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(96)
                    .leaveBalance(15)
                    .joiningDate(LocalDate.of(2025, 3, 10))
                    .build());

            userRepository.save(User.builder()
                    .id("EMP-103")
                    .email("vikram@diatrendz.com")
                    .passwordHash("Admin@123")
                    .fullName("Vikram Rathore")
                    .role("EMPLOYEE")
                    .phone("+91 98877 66554")
                    .profileImage("")
                    .department("Casting")
                    .specialization("Bangles & Bracelets")
                    .skillLevel("Intermediate")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(85)
                    .leaveBalance(10)
                    .joiningDate(LocalDate.of(2025, 4, 1))
                    .build());

            userRepository.save(User.builder()
                    .id("EMP-201")
                    .email("qc@diatrendz.com")
                    .passwordHash("Admin@123")
                    .fullName("David Miller (QC Lead)")
                    .role("QC")
                    .phone("+1 (555) 123-4567")
                    .profileImage("")
                    .department("QC")
                    .status("ACTIVE")
                    .leaveStatus("ACTIVE")
                    .productivityScore(98)
                    .leaveBalance(20)
                    .joiningDate(LocalDate.of(2025, 1, 20))
                    .build());

            // Seed active jewelry job cards and task states
            JobCard j1 = JobCard.builder()
                    .id("JOB-1001")
                    .taskId("TSK-1001")
                    .customerName("Tiffany & Co.")
                    .jewelryType("Ring")
                    .complexityLevel("Complex")
                    .priority("High")
                    .goldWeight(8.5)
                    .materialType("18K Yellow Gold")
                    .assignedEmployeeId("EMP-101")
                    .assignedEmployeeName("Rajesh Kumar")
                    .dueDate(LocalDate.of(2026, 6, 1))
                    .estimatedTime(12.0)
                    .approvedTime(10.0)
                    .actualTime(4.5)
                    .progressPercent(45)
                    .remarks("Faceted claw solitaire mount style config.")
                    .status("In Progress")
                    .build();

            j1.getTimeline().add(TimelineEvent.builder().status("Created").timestamp("2026-05-20T10:00:00Z").user("Team Lead").build());
            j1.getTimeline().add(TimelineEvent.builder().status("Assigned").timestamp("2026-05-20T10:15:00Z").user("Team Lead").build());
            j1.getTimeline().add(TimelineEvent.builder().status("Accepted").timestamp("2026-05-20T11:00:00Z").user("Rajesh Kumar").build());
            j1.getTimeline().add(TimelineEvent.builder().status("Estimation Submitted").timestamp("2026-05-20T11:10:00Z").payload("Est: 12 hrs").user("Rajesh Kumar").build());
            j1.getTimeline().add(TimelineEvent.builder().status("Approved").timestamp("2026-05-20T13:00:00Z").payload("App: 10 hrs").user("Team Lead").build());
            j1.getTimeline().add(TimelineEvent.builder().status("In Progress").timestamp("2026-05-21T08:00:00Z").user("Rajesh Kumar").build());
            jobCardRepository.save(j1);

            JobCard j2 = JobCard.builder()
                    .id("JOB-1002")
                    .taskId("TSK-1002")
                    .customerName("Cartier Dubai")
                    .jewelryType("Necklace")
                    .complexityLevel("Premium")
                    .priority("Urgent")
                    .goldWeight(42.0)
                    .materialType("Platinum 950")
                    .assignedEmployeeId("EMP-102")
                    .assignedEmployeeName("Deepa Patel")
                    .dueDate(LocalDate.of(2026, 5, 28))
                    .estimatedTime(24.0)
                    .approvedTime(24.0)
                    .actualTime(22.0)
                    .progressPercent(95)
                    .remarks("Hand crafting with micro-pave setting pattern integration.")
                    .status("QC Pending")
                    .build();

            j2.getTimeline().add(TimelineEvent.builder().status("Created").timestamp("2026-05-18T09:00:00Z").user("Team Lead").build());
            j2.getTimeline().add(TimelineEvent.builder().status("Assigned").timestamp("2026-05-18T09:10:00Z").user("Team Lead").build());
            j2.getTimeline().add(TimelineEvent.builder().status("Accepted").timestamp("2026-05-18T09:30:00Z").user("Deepa Patel").build());
            j2.getTimeline().add(TimelineEvent.builder().status("Approved").timestamp("2026-05-18T10:00:00Z").payload("App: 24 hrs").user("Team Lead").build());
            j2.getTimeline().add(TimelineEvent.builder().status("In Progress").timestamp("2026-05-18T10:15:00Z").user("Deepa Patel").build());
            j2.getTimeline().add(TimelineEvent.builder().status("QC Pending").timestamp("2026-05-22T17:00:00Z").user("Deepa Patel").build());
            jobCardRepository.save(j2);

            JobCard j3 = JobCard.builder()
                    .id("JOB-1003")
                    .taskId("TSK-1003")
                    .customerName("Bulgari Rome")
                    .jewelryType("Bracelet")
                    .complexityLevel("Medium")
                    .priority("Medium")
                    .goldWeight(14.5)
                    .materialType("18K Rose Gold")
                    .assignedEmployeeId("EMP-103")
                    .assignedEmployeeName("Vikram Rathore")
                    .dueDate(LocalDate.of(2026, 6, 5))
                    .estimatedTime(8.0)
                    .approvedTime(0.0)
                    .actualTime(0.0)
                    .progressPercent(0)
                    .remarks("Serpenti coiled modular style alignment check.")
                    .status("Waiting Approval")
                    .build();

            j3.getTimeline().add(TimelineEvent.builder().status("Created").timestamp("2026-05-22T08:00:00Z").user("Team Lead").build());
            j3.getTimeline().add(TimelineEvent.builder().status("Assigned").timestamp("2026-05-22T08:15:00Z").user("Team Lead").build());
            j3.getTimeline().add(TimelineEvent.builder().status("Accepted").timestamp("2026-05-22T09:00:00Z").user("Vikram Rathore").build());
            j3.getTimeline().add(TimelineEvent.builder().status("Estimation Submitted").timestamp("2026-05-22T09:05:00Z").payload("Est: 8 hrs").user("Vikram Rathore").build());
            jobCardRepository.save(j3);

            // Seed active leave requests
            leaveRequestRepository.save(LeaveRequest.builder()
                    .id("LEV-501")
                    .employeeId("EMP-103")
                    .employeeName("Vikram Rathore")
                    .leaveType("vacation")
                    .startDate(LocalDate.of(2026, 6, 10))
                    .endDate(LocalDate.of(2026, 6, 15))
                    .remarks("Family trip outside country.")
                    .status("PENDING")
                    .createdAt("2026-05-21T12:00:00Z")
                    .build());

            // Add standard startup log
            addAuditLog("EMP-001", "Dia Trendz SuperAdmin", "SUPER_ADMIN", "System Seeded", "PostgreSQL database seeded successfully with luxury ERP records.");
        }
    }
}
