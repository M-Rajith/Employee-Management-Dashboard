package com.peopleos.payroll.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PayrollRequest(

        @NotNull(message = "Basic salary is required")
        @Min(value = 0, message = "Basic salary cannot be negative")
        Long basic,

        @NotNull(message = "HRA is required")
        @Min(value = 0, message = "HRA cannot be negative")
        Long hra,

        @NotNull(message = "Allowances are required")
        @Min(value = 0, message = "Allowances cannot be negative")
        Long allowances,

        @NotNull(message = "Deductions are required")
        @Min(value = 0, message = "Deductions cannot be negative")
        Long deductions
) {
}
