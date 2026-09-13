package com.peopleos.employee.dto;

import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.EmployeeStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record EmployeeRequest(

        @NotBlank(message = "Employee code is required")
        @Size(max = 20, message = "Employee code must be at most 20 characters")
        String employeeCode,

        @NotBlank(message = "First name is required")
        @Size(max = 60, message = "First name must be at most 60 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 60, message = "Last name must be at most 60 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 120, message = "Email must be at most 120 characters")
        String email,

        @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "Phone must be a valid phone number")
        String phone,

        @NotNull(message = "Department is required")
        Department department,

        @NotBlank(message = "Role is required")
        @Size(max = 80, message = "Role must be at most 80 characters")
        String role,

        @NotBlank(message = "Team is required")
        @Size(max = 40, message = "Team must be at most 40 characters")
        String team,

        @NotNull(message = "Status is required")
        EmployeeStatus status,

        @NotBlank(message = "Location is required")
        @Size(max = 60, message = "Location must be at most 60 characters")
        String location,

        @NotNull(message = "Joining date is required")
        @PastOrPresent(message = "Joining date cannot be in the future")
        LocalDate joinedDate,

        Long managerId
) {
}
