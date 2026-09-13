package com.peopleos.position.dto;

import com.peopleos.employee.entity.Department;
import com.peopleos.position.entity.PositionStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PositionRequest(

        @NotBlank(message = "Job title is required")
        @Size(max = 100, message = "Title must be at most 100 characters")
        String title,

        @NotNull(message = "Department is required")
        Department department,

        @NotBlank(message = "Location is required")
        @Size(max = 60, message = "Location must be at most 60 characters")
        String location,

        @NotNull(message = "Status is required")
        PositionStatus status,

        @NotNull(message = "Openings count is required")
        @Min(value = 1, message = "At least one opening")
        @Max(value = 999, message = "Openings must be below 1000")
        Integer openings,

        @NotNull(message = "Posted date is required")
        @PastOrPresent(message = "Posted date cannot be in the future")
        LocalDate postedDate,

        @Size(max = 500, message = "Notes must be at most 500 characters")
        String notes
) {
}
