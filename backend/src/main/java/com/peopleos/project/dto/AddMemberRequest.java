package com.peopleos.project.dto;

import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(

        @NotNull(message = "employeeId is required")
        Long employeeId
) {
}
