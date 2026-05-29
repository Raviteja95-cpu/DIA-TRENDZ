package com.diatrendz.erp;

import com.diatrendz.erp.model.AuditLog;
import com.diatrendz.erp.repository.*;
import com.diatrendz.erp.service.ErpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ErpServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobCardRepository jobCardRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private EmailDomainRepository emailDomainRepository;

    @InjectMocks
    private ErpService erpService;

    @BeforeEach
    void setUp() {
        // Mock setups if necessary
    }

    @Test
    @DisplayName("Unit Test: Verify Audit Log Creation and Repository Save Integration")
    void testAddAuditLogSuccess() {
        // Arrange
        String userId = "EMP-001";
        String userName = "Admin";
        String role = "SUPER_ADMIN";
        String action = "Remove Employee";
        String details = "Offboarded employee due to transfer";

        // Act
        erpService.addAuditLog(userId, userName, role, action, details);

        // Assert
        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(logCaptor.capture());

        AuditLog savedLog = logCaptor.getValue();
        assertNotNull(savedLog);
        assertTrue(savedLog.getId().startsWith("LOG-"));
        assertEquals(userId, savedLog.getUserId());
        assertEquals(userName, savedLog.getUserName());
        assertEquals(role, savedLog.getUserRole());
        assertEquals(action, savedLog.getAction());
        assertEquals(details, savedLog.getDetails());
        assertNotNull(savedLog.getTimestamp());
    }

    @Test
    @DisplayName("Integration Test Mock: Verify DB Seeding Guard if Records Exist")
    void testSeedDatabaseDoesNotInsertIfUsersExist() {
        // Arrange
        when(userRepository.count()).thenReturn(5L);

        // Act
        erpService.seedDatabaseAndInitialize();

        // Assert
        verify(emailDomainRepository, never()).save(any());
        verify(userRepository, never()).save(any());
        verify(jobCardRepository, never()).save(any());
    }
}
