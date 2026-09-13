package com.peopleos.project.dto;

import com.peopleos.project.entity.ProjectWeightage;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectResponse(
        Long id,
        String name,
        ProjectWeightage weightage,
        LocalDateTime createdAt,
        List<ProjectMemberResponse> members
) {
}
