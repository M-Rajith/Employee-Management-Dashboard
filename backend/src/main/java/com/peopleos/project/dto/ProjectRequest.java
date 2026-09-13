package com.peopleos.project.dto;

import com.peopleos.project.entity.ProjectWeightage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProjectRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 120, message = "Project name must be at most 120 characters")
        String name,

        @NotNull(message = "Weightage is required")
        ProjectWeightage weightage
) {
}
