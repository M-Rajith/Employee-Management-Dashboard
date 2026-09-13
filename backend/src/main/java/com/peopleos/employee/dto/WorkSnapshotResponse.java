package com.peopleos.employee.dto;

import com.peopleos.activity.dto.ActivityResponse;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.EmployeeStatus;

import java.time.LocalDate;
import java.util.List;

public record WorkSnapshotResponse(
        Long id,
        String employeeCode,
        String fullName,
        String email,
        String phone,
        String role,
        String team,
        Department department,
        EmployeeStatus status,
        String location,
        LocalDate joinedDate,
        String managerName,
        double attendancePercentage,
        int leaveUsedDays,
        int leaveRemainingDays,
        int annualLeaveQuota,
        Long netSalary,
        String currentWorkStatus,
        List<ActivityResponse> recentActivities
) {
}
