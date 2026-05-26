package com.diatrendz.erp.controller;

import com.diatrendz.erp.model.JobCard;
import com.diatrendz.erp.repository.JobCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    @Autowired
    private JobCardRepository jobCardRepository;

    @GetMapping
    public ResponseEntity<List<JobCard>> searchHistory(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "jewelryType", required = false) String jewelryType,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) String startDateStr,
            @RequestParam(value = "endDate", required = false) String endDateStr
    ) {
        LocalDate startDate = null;
        LocalDate endDate = null;

        if (startDateStr != null && !startDateStr.isEmpty()) {
            try {
                startDate = LocalDate.parse(startDateStr);
            } catch (Exception ignored) {}
        }

        if (endDateStr != null && !endDateStr.isEmpty()) {
            try {
                endDate = LocalDate.parse(endDateStr);
            } catch (Exception ignored) {}
        }

        List<JobCard> results = jobCardRepository.searchHistory(
                query != null && !query.trim().isEmpty() ? query.trim() : null,
                jewelryType != null && !jewelryType.trim().isEmpty() ? jewelryType.trim() : null,
                employeeId != null && !employeeId.trim().isEmpty() ? employeeId.trim() : null,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                startDate,
                endDate
        );

        return ResponseEntity.ok(results);
    }
}
