package com.peopleos.employee.dto;

import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EmployeeResponse(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String phone,
        Department department,
        String role,
        String team,
        EmployeeStatus status,
        String location,
        LocalDate joinedDate,
        Long managerId,
        String managerName,
        LocalDateTime createdAt
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getEmployeeCode(),
                e.getFirstName(),
                e.getLastName(),
                e.fullName(),
                e.getEmail(),
                e.getPhone(),
                e.getDepartment(),
                e.getRole(),
                e.getTeam(),
                e.getStatus(),
                e.getLocation(),
                e.getJoinedDate(),
                e.getManager() != null ? e.getManager().getId() : null,
                e.getManager() != null ? e.getManager().fullName() : null,
                e.getCreatedAt()
        );
    }
}
