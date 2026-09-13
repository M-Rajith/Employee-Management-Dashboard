package com.peopleos.project.dto;

import com.peopleos.employee.entity.Employee;
import com.peopleos.project.entity.ProjectMember;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record ProjectMemberResponse(
        Long employeeId,
        String employeeCode,
        String fullName,
        String jobRole,
        String team,
        String memberRole,
        double yearsExperience
) {
    public static ProjectMemberResponse from(ProjectMember m) {
        Employee e = m.getEmployee();
        double years = ChronoUnit.MONTHS.between(e.getJoinedDate(), LocalDate.now()) / 12.0;
        return new ProjectMemberResponse(
                e.getId(), e.getEmployeeCode(), e.fullName(), e.getRole(), e.getTeam(),
                m.getMemberRole(), Math.round(years * 10) / 10.0);
    }
}
