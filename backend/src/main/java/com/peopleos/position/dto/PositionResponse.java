package com.peopleos.position.dto;

import com.peopleos.employee.entity.Department;
import com.peopleos.position.entity.Position;
import com.peopleos.position.entity.PositionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PositionResponse(
        Long id,
        String title,
        Department department,
        String location,
        PositionStatus status,
        int openings,
        LocalDate postedDate,
        String notes,
        LocalDateTime createdAt
) {
    public static PositionResponse from(Position p) {
        return new PositionResponse(
                p.getId(), p.getTitle(), p.getDepartment(), p.getLocation(),
                p.getStatus(), p.getOpenings(), p.getPostedDate(), p.getNotes(),
                p.getCreatedAt());
    }
}
