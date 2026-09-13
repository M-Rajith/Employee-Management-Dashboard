package com.peopleos.dashboard.dto;

import com.peopleos.employee.entity.Department;

public record DepartmentDistributionDto(
        Department department,
        long count,
        double percentage
) {
}
