package com.diatrendz.erp.repository;

import com.diatrendz.erp.model.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobCardRepository extends JpaRepository<JobCard, String> {
    Optional<JobCard> findByIdOrTaskId(String id, String taskId);
    List<JobCard> findByAssignedEmployeeId(String employeeId);
    
    @Query("SELECT j FROM JobCard j WHERE " +
           "(:query IS NULL OR LOWER(j.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.id) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.assignedEmployeeName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:jewelryType IS NULL OR j.jewelryType = :jewelryType) AND " +
           "(:employeeId IS NULL OR j.assignedEmployeeId = :employeeId) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:startDate IS NULL OR j.dueDate >= :startDate) AND " +
           "(:endDate IS NULL OR j.dueDate <= :endDate)")
    List<JobCard> searchHistory(
            @Param("query") String query,
            @Param("jewelryType") String jewelryType,
            @Param("employeeId") String employeeId,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
