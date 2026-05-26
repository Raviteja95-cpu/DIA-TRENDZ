package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.*;
import com.diatrendz.erp.repository.JobCardRepository;
import com.diatrendz.erp.repository.UserRepository;
import com.diatrendz.erp.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ErpService erpService;

    @GetMapping
    public ResponseEntity<List<JobCard>> getAllTasks() {
        return ResponseEntity.ok(jobCardRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> payload) {
        String customerName = (String) payload.get("customerName");
        String jewelryType = (String) payload.get("jewelryType");
        String complexityLevel = (String) payload.get("complexityLevel");
        String priority = (String) payload.get("priority");
        Object goldWeightObj = payload.get("goldWeight");
        String materialType = (String) payload.get("materialType");
        String assignedEmployeeId = (String) payload.get("assignedEmployeeId");
        String dueDateStr = (String) payload.get("dueDate");
        String remarks = (String) payload.get("remarks");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<User> assignedUserOpt = userRepository.findById(assignedEmployeeId);
        if (assignedUserOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Selected Employee does not exist."));
        }

        User assignedUser = assignedUserOpt.get();
        if ("ON_LEAVE".equals(assignedUser.getLeaveStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cannot assign tasks to an employee currently on active leave."));
        }

        long nextId = 1001 + jobCardRepository.count();
        String jobUuid = "JOB-" + nextId;
        String taskUuid = "TSK-" + nextId;

        Double goldWeight = 0.0;
        if (goldWeightObj != null) {
            try {
                goldWeight = Double.parseDouble(goldWeightObj.toString());
            } catch (NumberFormatException ignored) {}
        }

        LocalDate dueDate = LocaleDateOrFallback(dueDateStr, 3);

        JobCard newJob = JobCard.builder()
                .id(jobUuid)
                .taskId(taskUuid)
                .customerName(customerName != null ? customerName : "Custom Retail")
                .jewelryType(jewelryType != null ? jewelryType : "Ring")
                .complexityLevel(complexityLevel != null ? complexityLevel : "Medium")
                .priority(priority != null ? priority : "Medium")
                .goldWeight(goldWeight)
                .materialType(materialType != null ? materialType : "18K Gold")
                .assignedEmployeeId(assignedEmployeeId)
                .assignedEmployeeName(assignedUser.getFullName())
                .dueDate(dueDate)
                .estimatedTime(0.0)
                .approvedTime(0.0)
                .actualTime(0.0)
                .progressPercent(0)
                .remarks(remarks != null ? remarks : "")
                .status("Assigned")
                .build();

        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        newJob.getTimeline().add(TimelineEvent.builder().status("Created").timestamp(now).user(userName).build());
        newJob.getTimeline().add(TimelineEvent.builder().status("Assigned").timestamp(now)
                .payload("Assigned core role to " + assignedUser.getFullName()).user(userName).build());

        jobCardRepository.save(newJob);

        erpService.addAuditLog(userId, userName, userRole, "Create Task", 
                "Initiated production job card " + newJob.getId() + " for customer " + customerName);

        return ResponseEntity.ok(Map.of("success", true, "task", newJob));
    }

    @PostMapping("/reassign")
    public ResponseEntity<?> reassignTask(@RequestBody Map<String, Object> payload) {
        String taskId = (String) payload.get("taskId");
        String newEmployeeId = (String) payload.get("newEmployeeId");
        String newEmployeeName = (String) payload.get("newEmployeeName");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<JobCard> taskOpt = jobCardRepository.findByIdOrTaskId(taskId, taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found"));
        }

        JobCard task = taskOpt.get();
        String oldEmployeeName = task.getAssignedEmployeeName() != null ? task.getAssignedEmployeeName() : "Unassigned";

        task.setAssignedEmployeeId(newEmployeeId);
        task.setAssignedEmployeeName(newEmployeeName);

        task.getTimeline().add(TimelineEvent.builder()
                .status(task.getStatus())
                .payload("Job formally reassigned from " + oldEmployeeName + " to " + newEmployeeName + ".")
                .user(userName)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build());

        jobCardRepository.save(task);

        erpService.addAuditLog(userId, userName, userRole, "Reassign Job", 
                "Administrator reassigned job card " + task.getId() + " to " + newEmployeeName + ".");

        return ResponseEntity.ok(Map.of("success", true, "task", task));
    }

    @PostMapping("/status")
    public ResponseEntity<?> updateTaskStatus(@RequestBody Map<String, Object> payload) {
        String taskId = (String) payload.get("taskId");
        String status = (String) payload.get("status");
        Object extraPayload = payload.get("extraPayload");
        String remarks = (String) payload.get("remarks");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<JobCard> taskOpt = jobCardRepository.findByIdOrTaskId(taskId, taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Production task card not found."));
        }

        JobCard task = taskOpt.get();
        String oldStatus = task.getStatus();
        task.setStatus(status);

        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);

        if ("Accepted".equals(status)) {
            task.getTimeline().add(TimelineEvent.builder().status("Accepted").timestamp(now).user(userName).build());
        } else if ("Waiting Approval".equals(status)) {
            if (extraPayload != null) {
                try {
                    task.setEstimatedTime(Double.parseDouble(extraPayload.toString()));
                } catch (NumberFormatException ignored) {}
            }
            task.getTimeline().add(TimelineEvent.builder()
                    .status("Estimation Submitted")
                    .timestamp(now)
                    .payload("Est: " + task.getEstimatedTime() + " hours")
                    .user(userName)
                    .build());
        } else if ("Approved".equals(status)) {
            if (extraPayload != null) {
                try {
                    task.setApprovedTime(Double.parseDouble(extraPayload.toString()));
                } catch (NumberFormatException ignored) {}
            }
            task.getTimeline().add(TimelineEvent.builder()
                    .status("Approved")
                    .timestamp(now)
                    .payload("App: " + task.getApprovedTime() + " hours")
                    .user(userName)
                    .build());
        } else if ("In Progress".equals(status)) {
            if (!"Paused".equals(oldStatus) && !"Switched".equals(oldStatus)) {
                task.setStartedAt(now);
            }
            task.setLastResumedAt(now);
            task.getTimeline().add(TimelineEvent.builder().status("In Progress").timestamp(now).user(userName).build());
        } else if ("Paused".equals(status) || "Switched".equals(status)) {
            String pauseReason = remarks != null ? remarks : "Unspecified pause";
            String lastActive = task.getLastResumedAt() != null ? task.getLastResumedAt() : 
                               (task.getStartedAt() != null ? task.getStartedAt() : now);
            
            try {
                long lastActiveMs = LocalDateTime.parse(lastActive, DateTimeFormatter.ISO_DATE_TIME)
                                    .atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
                long sessionDurationMs = System.currentTimeMillis() - lastActiveMs;
                task.setTotalWorkedMs(task.getTotalWorkedMs() + sessionDurationMs);
                task.setActualTime(Math.round((task.getTotalWorkedMs() / (1000.0 * 60 * 60)) * 100.0) / 100.0);

                InterruptionLog pauseLog = InterruptionLog.builder()
                        .pausedAt(now)
                        .reason(pauseReason)
                        .durationMinutes((int) (sessionDurationMs / (1000 * 60)))
                        .build();

                task.getInterruptionLogs().add(pauseLog);
            } catch (Exception ignored) {}

            task.getTimeline().add(TimelineEvent.builder()
                    .status(status)
                    .timestamp(now)
                    .payload("Paused due to: " + pauseReason)
                    .user(userName)
                    .build());
        } else if ("QC Pending".equals(status)) {
            String lastActive = task.getLastResumedAt() != null ? task.getLastResumedAt() : 
                               (task.getStartedAt() != null ? task.getStartedAt() : now);
            if ("In Progress".equals(oldStatus)) {
                try {
                    long lastActiveMs = LocalDateTime.parse(lastActive, DateTimeFormatter.ISO_DATE_TIME)
                                        .atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli();
                    long sessionDurationMs = System.currentTimeMillis() - lastActiveMs;
                    task.setTotalWorkedMs(task.getTotalWorkedMs() + sessionDurationMs);
                    task.setActualTime(Math.round((task.getTotalWorkedMs() / (1000.0 * 60 * 60)) * 100.0) / 100.0);
                } catch (Exception ignored) {}
            }
            task.setProgressPercent(100);
            task.getTimeline().add(TimelineEvent.builder().status("QC Pending").timestamp(now).user(userName).build());
        } else {
            task.getTimeline().add(TimelineEvent.builder().status(status).timestamp(now).user(userName).build());
        }

        jobCardRepository.save(task);

        erpService.addAuditLog(userId, userName, userRole, "Task Status Shift", 
                "Shifted " + task.getId() + " from " + oldStatus + " to " + status);

        return ResponseEntity.ok(Map.of("success", true, "task", task));
    }

    @PostMapping("/qc-review")
    public ResponseEntity<?> qcReview(@RequestBody Map<String, Object> payload) {
        String taskId = (String) payload.get("taskId");
        String action = (String) payload.get("action"); // 'approve' | 'rerework' | 'rework'
        String remarks = (String) payload.get("remarks");
        String defects = (String) payload.get("defects");
        Object reworkHoursObj = payload.get("reworkHours");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        if (taskId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Task ID is a required field for quality control inspections."));
        }

        Optional<JobCard> taskOpt = jobCardRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Task record not found inside database."));
        }

        JobCard task = taskOpt.get();
        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);

        task.setQcRemarks(remarks);
        task.setQcDefects(defects != null ? defects : "");

        if ("approve".equals(action)) {
            task.setStatus("Completed");
            task.setProgressPercent(100);
            task.getTimeline().add(TimelineEvent.builder()
                    .status("Completed")
                    .timestamp(now)
                    .payload("QC Approved. Jewels shipped.")
                    .user(userName != null ? userName : "QC Team")
                    .build());

            // Tweak score productivity
            Optional<User> workerOpt = userRepository.findById(task.getAssignedEmployeeId());
            if (workerOpt.isPresent()) {
                User w = workerOpt.get();
                boolean isPunctual = task.getDueDate() != null && (!LocalDate.now().isAfter(task.getDueDate()));
                int scoreTweak = isPunctual ? 3 : 1;
                w.setProductivityScore(Math.min(100, (w.getProductivityScore() != null ? w.getProductivityScore() : 85) + scoreTweak));
                userRepository.save(w);
            }
        } else {
            task.setStatus("Rework");
            task.setProgressPercent(60);
            
            Double reworkHours = 2.0;
            if (reworkHoursObj != null) {
                try {
                    reworkHours = Double.parseDouble(reworkHoursObj.toString());
                } catch (NumberFormatException ignored) {}
            }
            task.setReworkHours(reworkHours);
            task.getTimeline().add(TimelineEvent.builder()
                    .status("QC Rejected")
                    .timestamp(now)
                    .payload("Rework Required: " + (defects != null && !defects.isEmpty() ? defects : "Minor adjustments") + ". Alloc: " + reworkHours + "h.")
                    .user(userName != null ? userName : "QC Team")
                    .build());

            // Deduct productivity
            Optional<User> workerOpt = userRepository.findById(task.getAssignedEmployeeId());
            if (workerOpt.isPresent()) {
                User w = workerOpt.get();
                w.setProductivityScore(Math.max(50, (w.getProductivityScore() != null ? w.getProductivityScore() : 85) - 2));
                userRepository.save(w);
            }
        }

        jobCardRepository.save(task);

        erpService.addAuditLog(userId != null ? userId : "QC-SYSTEM", 
                userName != null ? userName : "QC Reviewer", 
                userRole != null ? userRole : "QC", 
                "QC " + action.toUpperCase(), 
                "Reviewed item " + task.getId() + " with outcome: " + task.getStatus());

        return ResponseEntity.ok(Map.of("success", true, "task", task));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestBody Map<String, Object> payload) {
        String taskId = (String) payload.get("taskId");
        String imageBase64 = (String) payload.get("imageBase64");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<JobCard> taskOpt = jobCardRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found."));
        }

        JobCard task = taskOpt.get();
        task.getWorkImages().add(imageBase64);
        jobCardRepository.save(task);

        erpService.addAuditLog(userId, userName, userRole, "Image Upload", 
                "Uploaded production visual evidence to card " + taskId);

        return ResponseEntity.ok(Map.of("success", true, "task", task));
    }

    private LocalDate LocaleDateOrFallback(String str, int plusDays) {
        if (str != null && !str.isEmpty()) {
            try {
                return LocalDate.parse(str);
            } catch (Exception ignored) {}
        }
        return LocalDate.now().plusDays(plusDays);
    }
}
