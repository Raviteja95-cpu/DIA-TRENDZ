package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.User;
import com.diatrendz.erp.repository.EmailDomainRepository;
import com.diatrendz.erp.repository.UserRepository;
import com.diatrendz.erp.service.ErpService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
public class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private EmailDomainRepository emailDomainRepository;

    @MockBean
    private ErpService erpService;

    @Test
    @DisplayName("API Test: Get All Employees matches structural JSON response array")
    void testGetAllEmployeesSuccess() throws Exception {
        mockMvc.perform(get("/api/employees")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("RBAC: Unprivileged role (EMPLOYEE) is forbidden from enrolling staff")
    void testCreateEmployeeByUnprivilegedRoleFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "newhire@diatrendz.com");
        payload.put("fullName", "John Doe");
        payload.put("role", "EMPLOYEE");
        payload.put("userRole", "EMPLOYEE"); // Regular employee trying to enroll someone

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Administrators and Super Administrators can enroll crew members."));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("RBAC: QC officer is forbidden from enrolling staff")
    void testCreateEmployeeByQCRoleFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "newhire@diatrendz.com");
        payload.put("fullName", "Jane QC");
        payload.put("role", "EMPLOYEE");
        payload.put("userRole", "QC"); // QC officer trying to enroll someone

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Administrators and Super Administrators can enroll crew members."));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("RBAC: Regular ADMIN (TL) cannot create another ADMIN or SUPER_ADMIN")
    void testAdminCreateSuperAdminFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "badadmin@diatrendz.com");
        payload.put("fullName", "Rogue Coordinator");
        payload.put("role", "SUPER_ADMIN"); // Requesting Super Admin role
        payload.put("userRole", "ADMIN");       // Created by regular Admin (Team Lead)

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("TL (ADMIN) does not have privileges to create other Admin or Super Admin profiles."));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("RBAC: SUPER_ADMIN succeeds in creating other SUPER_ADMIN")
    void testSuperAdminCreateSuperAdminSucceeds() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "partneradmin@diatrendz.com");
        payload.put("fullName", "Partner Executive");
        payload.put("role", "SUPER_ADMIN");     // Requesting Super Admin role
        payload.put("userRole", "SUPER_ADMIN"); // Enrolled by another Super Admin

        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("RBAC: Unprivileged role update is blocked")
    void testUpdateEmployeeWithUnprivilegedRoleFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "EMP-105");
        payload.put("fullName", "Sneaky Update");
        payload.put("userRole", "EMPLOYEE"); // Unauthorized update role

        mockMvc.perform(post("/api/employees/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Unauthorized permission level for saving changes."));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("RBAC: ADMIN role update succeeds")
    void testUpdateEmployeeWithAdminSucceeds() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", "EMP-105");
        payload.put("fullName", "Updated Workshop Name");
        payload.put("userRole", "ADMIN"); // Authorized role for updates

        User mockUser = new User();
        mockUser.setId("EMP-105");
        mockUser.setFullName("Original Name");
        when(userRepository.findById("EMP-105")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(post("/api/employees/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(userRepository, times(1)).save(any(User.class));
    }
}
