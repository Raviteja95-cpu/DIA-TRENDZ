package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.LeaveRequest;
import com.diatrendz.erp.model.User;
import com.diatrendz.erp.repository.JobCardRepository;
import com.diatrendz.erp.repository.LeaveRequestRepository;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LeaveController.class)
public class LeaveControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LeaveRequestRepository leaveRequestRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JobCardRepository jobCardRepository;

    @MockBean
    private ErpService erpService;

    @Test
    @DisplayName("API Test: Get All Leave Requests succeeds")
    void testGetAllLeaveRequestsSuccess() throws Exception {
        mockMvc.perform(get("/api/leave")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC: Regular worker/EMPLOYEE cannot extend leave requests")
    void testEmployeeExtendLeaveFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("leaveId", "LEV-1718290000");
        payload.put("newEndDate", "2026-06-15");
        payload.put("userRole", "EMPLOYEE"); // Only standard roles

        mockMvc.perform(post("/api/leave/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Admins or Super Admins are authorized to extend leaves."));

        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    @DisplayName("RBAC: QC officer cannot extend leave requests")
    void testQCExtendLeaveFails() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("leaveId", "LEV-1718290000");
        payload.put("newEndDate", "2026-06-15");
        payload.put("userRole", "QC"); // QC cannot extend leaves

        mockMvc.perform(post("/api/leave/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Admins or Super Admins are authorized to extend leaves."));

        verify(leaveRequestRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    @DisplayName("RBAC: ADMIN role can successfully extend leave requests and deduct balances")
    void testAdminExtendLeaveSucceeds() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("leaveId", "LEV-1718290000");
        payload.put("newEndDate", "2026-06-15");
        payload.put("userRole", "ADMIN");

        LeaveRequest mockReq = LeaveRequest.builder()
                .id("LEV-1718290000")
                .employeeId("EMP-101")
                .startDate(LocalDate.of(2026, 6, 1))
                .endDate(LocalDate.of(2026, 6, 5))
                .build();

        User mockUser = new User();
        mockUser.setId("EMP-101");
        mockUser.setLeaveBalance(12);

        when(leaveRequestRepository.findById("LEV-1718290000")).thenReturn(Optional.of(mockReq));
        when(userRepository.findById("EMP-101")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(post("/api/leave/extend")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(leaveRequestRepository, times(1)).save(any(LeaveRequest.class));
        verify(userRepository, times(1)).save(any(User.class));
    }
}
