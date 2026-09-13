package com.peopleos.payroll.dto;

import com.peopleos.payroll.entity.Payroll;

public record PayrollResponse(
        Long id,
        Long employeeId,
        String employeeCode,
        String employeeName,
        String role,
        String team,
        long basic,
        long hra,
        long allowances,
        long deductions,
        long netSalary
) {
    public static PayrollResponse from(Payroll p) {
        return new PayrollResponse(
                p.getId(),
                p.getEmployee().getId(),
                p.getEmployee().getEmployeeCode(),
                p.getEmployee().fullName(),
                p.getEmployee().getRole(),
                p.getEmployee().getTeam(),
                p.getBasic(), p.getHra(), p.getAllowances(), p.getDeductions(),
                p.net());
    }
}
