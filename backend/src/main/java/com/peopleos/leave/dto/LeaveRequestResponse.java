package com.peopleos.leave.dto;

import com.peopleos.leave.entity.LeaveRequest;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.leave.entity.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        String employeeRole,
        String employeeDepartment,
        LeaveType leaveType,
        LocalDate startDate,
        LocalDate endDate,
        int duration,
        LeaveStatus status,
        LocalDateTime createdAt
) {
    public static LeaveRequestResponse from(LeaveRequest l) {
        return new LeaveRequestResponse(
                l.getId(),
                l.getEmployee().getId(),
                l.getEmployee().getEmployeeCode(),
                l.getEmployee().fullName(),
                l.getEmployee().getRole(),
                l.getEmployee().getDepartment().name(),
                l.getLeaveType(),
                l.getStartDate(),
                l.getEndDate(),
                l.getDuration(),
                l.getStatus(),
                l.getCreatedAt()
        );
    }
}
