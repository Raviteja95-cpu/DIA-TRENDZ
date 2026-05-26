package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.*;
import com.diatrendz.erp.repository.LeaveRequestRepository;
import com.diatrendz.erp.repository.UserRepository;
import com.diatrendz.erp.repository.JobCardRepository;
import com.diatrendz.erp.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobCardRepository jobCardRepository;

    @Autowired
    private ErpService erpService;

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createLeaveRequest(@RequestBody Map<String, Object> payload) {
        String employeeId = (String) payload.get("employeeId");
        String leaveType = (String) payload.get("leaveType");
        String startDateStr = (String) payload.get("startDate");
        String endDateStr = (String) payload.get("endDate");
        String remarks = (String) payload.get("remarks");

        Optional<User> employeeOpt = userRepository.findById(employeeId);
        if (employeeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }

        User employee = employeeOpt.get();
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        long requestedDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        requestedDays = Math.max(1, requestedDays);

        LeaveRequest newRequest = LeaveRequest.builder()
                .id("LEV-" + System.currentTimeMillis())
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .leaveType(leaveType)
                .startDate(startDate)
                .endDate(endDate)
                .remarks(remarks)
                .status("PENDING")
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();

        leaveRequestRepository.save(newRequest);

        erpService.addAuditLog(employeeId, employee.getFullName(), employee.getRole(), "Request Leave", 
                "Requested standard leave (" + requestedDays + " days) starting " + startDateStr);

        return ResponseEntity.ok(Map.of("success", true, "request", newRequest));
    }

    @PostMapping("/review")
    public ResponseEntity<?> reviewLeaveRequest(@RequestBody Map<String, Object> payload) {
        String leaveId = (String) payload.get("leaveId");
        String status = (String) payload.get("status"); // APPROVED, REJECTED
        String adminRemarks = (String) payload.get("adminRemarks");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        Optional<LeaveRequest> requestOpt = leaveRequestRepository.findById(leaveId);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave request not found."));
        }

        LeaveRequest request = requestOpt.get();
        request.setStatus(status);
        request.setAdminRemarks(adminRemarks);

        Optional<User> targetWorkerOpt = userRepository.findById(request.getEmployeeId());

        if ("APPROVED".equals(status) && targetWorkerOpt.isPresent()) {
            User worker = targetWorkerOpt.get();
            worker.setLeaveStatus("ON_LEAVE");

            long reqDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            reqDays = Math.max(1, reqDays);

            int balance = worker.getLeaveBalance() != null ? worker.getLeaveBalance() : 15;
            worker.setLeaveBalance(Math.max(0, balance - (int) reqDays));
            userRepository.save(worker);

            // System auto-pause worker tasks
            List<JobCard> tasks = jobCardRepository.findByAssignedEmployeeId(worker.getId());
            tasks.forEach(t -> {
                if ("In Progress".equals(t.getStatus())) {
                    t.setStatus("Paused");
                    t.getTimeline().add(TimelineEvent.builder()
                            .status("Paused")
                            .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                            .payload("System auto-paused task: Worker approved leave active shift")
                            .user("System Server")
                            .build());
                    jobCardRepository.save(t);
                }
            });
        } else if ("REJECTED".equals(status) && targetWorkerOpt.isPresent()) {
            User worker = targetWorkerOpt.get();
            worker.setLeaveStatus("ACTIVE");
            userRepository.save(worker);
        }

        leaveRequestRepository.save(request);

        erpService.addAuditLog(userId, userName, userRole, "Leave approved (" + status + ")", 
                "Reviewed leave ID " + leaveId + " with remarks: " + adminRemarks);

        return ResponseEntity.ok(Map.of("success", true, "request", request));
    }

    @PostMapping("/extend")
    public ResponseEntity<?> extendLeave(@RequestBody Map<String, Object> payload) {
        String leaveId = (String) payload.get("leaveId");
        String newEndDateStr = (String) payload.get("newEndDate");
        String remarks = (String) payload.get("remarks");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        if (!"SUPER_ADMIN".equals(userRole) && !"ADMIN".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only Admins or Super Admins are authorized to extend leaves."));
        }

        Optional<LeaveRequest> requestOpt = leaveRequestRepository.findById(leaveId);
        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave request not found."));
        }

        LeaveRequest request = requestOpt.get();
        LocalDate oldEndDate = request.getEndDate();
        LocalDate newEndDate = LocalDate.parse(newEndDateStr);
        request.setEndDate(newEndDate);

        String extRemark = "Extended until " + newEndDateStr + (remarks != null ? ": " + remarks : "");
        String currentRem = request.getAdminRemarks();
        request.setAdminRemarks(currentRem == null || currentRem.isEmpty() ? extRemark : currentRem + " | " + extRemark);

        Optional<User> targetWorkerOpt = userRepository.findById(request.getEmployeeId());
        if (targetWorkerOpt.isPresent()) {
            User worker = targetWorkerOpt.get();
            long oldDays = ChronoUnit.DAYS.between(request.getStartDate(), oldEndDate) + 1;
            long newDays = ChronoUnit.DAYS.between(request.getStartDate(), newEndDate) + 1;
            long addedDays = Math.max(0, newDays - oldDays);

            int balance = worker.getLeaveBalance() != null ? worker.getLeaveBalance() : 15;
            worker.setLeaveBalance(Math.max(0, balance - (int) addedDays));
            userRepository.save(worker);
        }

        leaveRequestRepository.save(request);

        erpService.addAuditLog(userId, userName, userRole, "Extend Leave", 
                "Extended leave ID " + leaveId + " to " + newEndDateStr + ". Remarks: " + remarks);

        return ResponseEntity.ok(Map.of("success", true, "request", request));
    }
}
