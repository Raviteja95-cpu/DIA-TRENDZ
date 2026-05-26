package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.*;
import com.diatrendz.erp.repository.AuditLogRepository;
import com.diatrendz.erp.repository.JobCardRepository;
import com.diatrendz.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MetricsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        List<User> users = userRepository.findAll();
        List<JobCard> tasks = jobCardRepository.findAll();

        long activeEmployees = users.stream()
                .filter(u -> "EMPLOYEE".equals(u.getRole()) && "ACTIVE".equals(u.getLeaveStatus()) && "ACTIVE".equals(u.getStatus()))
                .count();

        long employeesOnLeave = users.stream()
                .filter(u -> "ON_LEAVE".equals(u.getLeaveStatus()))
                .count();

        long jobsInProgress = tasks.stream()
                .filter(t -> "In Progress".equals(t.getStatus()))
                .count();

        long urgentTasks = tasks.stream()
                .filter(t -> "Urgent".equals(t.getPriority()) && !"Completed".equals(t.getStatus()))
                .count();

        long pendingApprovals = tasks.stream()
                .filter(t -> "Waiting Approval".equals(t.getStatus()))
                .count();

        long qcPendingJobs = tasks.stream()
                .filter(t -> "QC Pending".equals(t.getStatus()))
                .count();

        long completedToday = tasks.stream()
                .filter(t -> "Completed".equals(t.getStatus()))
                .count();

        LocalDate now = LocalDate.now();
        long delayedJobs = tasks.stream()
                .filter(t -> !"Completed".equals(t.getStatus()) && !"Cancelled".equals(t.getStatus()) && t.getDueDate() != null && t.getDueDate().isBefore(now))
                .count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("activeEmployees", activeEmployees);
        metrics.put("employeesOnLeave", employeesOnLeave);
        metrics.put("jobsInProgress", jobsInProgress);
        metrics.put("delayedJobs", delayedJobs);
        metrics.put("urgentTasks", urgentTasks);
        metrics.put("completedToday", completedToday);
        metrics.put("pendingApprovals", pendingApprovals);
        metrics.put("qcPendingJobs", qcPendingJobs);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/diagnostics")
    public ResponseEntity<?> getDiagnostics() {
        Map<String, Object> diags = new HashMap<>();
        diags.put("engine", "Dia Trendz Java Spring-Boot Orchestration V3");
        diags.put("uptime", System.currentTimeMillis() / 1000); // placeholder or standard system calculation
        diags.put("platform", System.getProperty("os.name"));
        diags.put("javaVersion", System.getProperty("java.version"));

        Map<String, Object> net = new HashMap<>();
        net.put("lanSupport", true);
        net.put("wifiSupport", true);
        net.put("portBind", 8080);
        net.put("databaseType", "PostgreSQL / H2 Hibernate Relational");
        diags.put("networking", net);

        return ResponseEntity.ok(diags);
    }
}
