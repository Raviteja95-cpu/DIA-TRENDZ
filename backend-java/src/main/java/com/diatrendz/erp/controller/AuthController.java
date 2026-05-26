package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.User;
import com.diatrendz.erp.repository.UserRepository;
import com.diatrendz.erp.repository.EmailDomainRepository;
import com.diatrendz.erp.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailDomainRepository emailDomainRepository;

    @Autowired
    private ErpService erpService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and Password are required fields."));
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User with this email does not exist."));
        }

        User user = userOpt.get();
        if ("DISABLED".equals(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "This account has been deactivated by Super Admin."));
        }

        if (!password.equals(user.getPasswordHash())) {
            erpService.addAuditLog(user.getId(), user.getFullName(), user.getRole(), 
                    "Failed Login", "Incorrect password attempt from email " + email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid password. Please try again."));
        }

        erpService.addAuditLog(user.getId(), user.getFullName(), user.getRole(), 
                "Auth Login", "Authenticated successfully via Java Spring ERP portal.");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String fullName = (String) payload.get("fullName");
        String phone = (String) payload.get("phone");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "User ID is required."));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        User user = userOpt.get();

        if (email != null && !email.isEmpty()) {
            String normalizedEmail = email.toLowerCase();
            String domainPart = "@" + normalizedEmail.substring(normalizedEmail.indexOf("@") + 1);

            boolean isPublicProvider = List.of("@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com")
                    .contains(domainPart);

            if (!isPublicProvider) {
                boolean isConfigured = emailDomainRepository.findByDomainIgnoreCase(domainPart).isPresent();
                if (!isConfigured) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "The email domain '" + domainPart + "' is not configured."));
                }
            }
            user.setEmail(normalizedEmail);
        }

        if (password != null && !password.isEmpty()) {
            user.setPasswordHash(password);
        }
        if (fullName != null && !fullName.isEmpty()) {
            user.setFullName(fullName.trim());
        }
        if (phone != null) {
            user.setPhone(phone);
        }

        userRepository.save(user);

        erpService.addAuditLog(user.getId(), user.getFullName(), user.getRole(), 
                "Profile Update", "Modified terminal credentials (Email: " + user.getEmail() + ")");

        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }
}
