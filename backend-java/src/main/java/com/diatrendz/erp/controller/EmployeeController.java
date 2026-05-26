package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.User;
import com.diatrendz.erp.repository.UserRepository;
import com.diatrendz.erp.repository.EmailDomainRepository;
import com.diatrendz.erp.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailDomainRepository emailDomainRepository;

    @Autowired
    private ErpService erpService;

    @GetMapping
    public ResponseEntity<List<User>> getAllEmployees() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String fullName = (String) payload.get("fullName");
        String role = (String) payload.get("role");
        String phone = (String) payload.get("phone");
        String department = (String) payload.get("department");
        String specialization = (String) payload.get("specialization");
        String skillLevel = (String) payload.get("skillLevel");
        Object leaveBalanceObj = payload.get("leaveBalance");
        String password = (String) payload.get("password");
        String profileImage = (String) payload.get("profileImage");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        // Enroll permission limit verification
        if (!"SUPER_ADMIN".equals(userRole) && !"ADMIN".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only Administrators and Super Administrators can enroll crew members."));
        }

        if ("ADMIN".equals(userRole) && ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "TL (ADMIN) does not have privileges to create other Admin or Super Admin profiles."));
        }

        if ("SUPER_ADMIN".equals(role) && !"SUPER_ADMIN".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only Super Administrators can enroll other Super Admins."));
        }

        if (email == null || fullName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email and Full name are required."));
        }

        String normalizedEmail = email.toLowerCase();
        String domainPart = "@" + normalizedEmail.substring(normalizedEmail.indexOf("@") + 1);
        boolean isPublicProvider = List.of("@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com")
                .contains(domainPart);

        if (!isPublicProvider) {
            boolean isConfigured = emailDomainRepository.findByDomainIgnoreCase(domainPart).isPresent();
            if (!isConfigured) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Registered domain registry matching '" + domainPart + "' is missing. Create the domain first."));
            }
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "A user with email " + email + " already exists."));
        }

        String prefix = "SUPER_ADMIN".equals(role) ? "ADM" : "ADMIN".equals(role) ? "TL" : "QC".equals(role) ? "QC" : "EMP";
        String newEmpId = prefix + "-" + (100 + userRepository.count() + 1);

        Integer balance = 12;
        if (leaveBalanceObj != null) {
            try {
                balance = Integer.parseInt(leaveBalanceObj.toString());
            } catch (NumberFormatException ignored) {}
        }

        User newUser = User.builder()
                .id(newEmpId)
                .email(normalizedEmail)
                .fullName(fullName.trim())
                .role(role != null ? role : "EMPLOYEE")
                .phone(phone != null ? phone : "")
                .profileImage(profileImage != null ? profileImage : "")
                .department(department != null ? department : "General Fabrication")
                .specialization(specialization != null ? specialization : "Assembly")
                .skillLevel(skillLevel != null ? skillLevel : "Intermediate")
                .status("ACTIVE")
                .leaveStatus("ACTIVE")
                .productivityScore(85)
                .leaveBalance(balance)
                .joiningDate(LocalDate.now())
                .passwordHash(password != null ? password : "Admin@123")
                .build();

        userRepository.save(newUser);
        erpService.addAuditLog(userId, userName, userRole, "Create Employee", 
                "Created new crew member " + fullName + " with ID " + newUser.getId());

        return ResponseEntity.ok(Map.of("success", true, "employee", newUser));
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateEmployee(@RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        String fullName = (String) payload.get("fullName");
        String email = (String) payload.get("email");
        String phone = (String) payload.get("phone");
        String profileImage = (String) payload.get("profileImage");
        String department = (String) payload.get("department");
        String specialization = (String) payload.get("specialization");
        String skillLevel = (String) payload.get("skillLevel");
        String status = (String) payload.get("status");
        Object leaveBalance = payload.get("leaveBalance");
        Object productivityScore = payload.get("productivityScore");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");
        String userRole = (String) payload.get("userRole");

        if (!"SUPER_ADMIN".equals(userRole) && !"ADMIN".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Unauthorized permission level for saving changes."));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found."));
        }

        User target = userOpt.get();

        if (fullName != null) target.setFullName(fullName);
        if (email != null) target.setEmail(email.toLowerCase());
        if (phone != null) target.setPhone(phone);
        if (profileImage != null) target.setProfileImage(profileImage);
        if (department != null) target.setDepartment(department);
        if (specialization != null) target.setSpecialization(specialization);
        if (skillLevel != null) target.setSkillLevel(skillLevel);
        if (status != null) target.setStatus(status);

        if (leaveBalance != null) {
            try {
                target.setLeaveBalance(Integer.parseInt(leaveBalance.toString()));
            } catch (NumberFormatException ignored) {}
        }

        if (productivityScore != null) {
            try {
                target.setProductivityScore(Integer.parseInt(productivityScore.toString()));
            } catch (NumberFormatException ignored) {}
        }

        userRepository.save(target);
        erpService.addAuditLog(userId, userName, userRole, "Modify Employee", 
                "Modified profile for worker " + target.getFullName() + " (" + target.getId() + ")");

        return ResponseEntity.ok(Map.of("success", true, "employee", target));
    }
}
