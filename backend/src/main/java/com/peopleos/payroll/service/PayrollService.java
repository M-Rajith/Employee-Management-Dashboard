package com.peopleos.payroll.service;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.payroll.dto.PayrollRequest;
import com.peopleos.payroll.dto.PayrollResponse;
import com.peopleos.payroll.entity.Payroll;
import com.peopleos.payroll.repository.PayrollRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityRepository activityRepository;

    public PayrollService(PayrollRepository payrollRepository,
                          EmployeeRepository employeeRepository,
                          ActivityRepository activityRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public List<PayrollResponse> list() {
        return payrollRepository.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getEmployee().fullName().toLowerCase()))
                .map(PayrollResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PayrollResponse getForEmployee(Long employeeId) {
        Employee employee = findEmployee(employeeId);
        return payrollRepository.findByEmployeeId(employeeId)
                .map(PayrollResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No payroll record for " + employee.fullName()));
    }

    /** Create or update the payroll breakdown for an employee (upsert). */
    @Transactional
    public PayrollResponse upsert(Long employeeId, PayrollRequest request) {
        Employee employee = findEmployee(employeeId);
        Payroll payroll = payrollRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> {
                    Payroll p = new Payroll();
                    p.setEmployee(employee);
                    return p;
                });
        payroll.setBasic(request.basic());
        payroll.setHra(request.hra());
        payroll.setAllowances(request.allowances());
        payroll.setDeductions(request.deductions());
        Payroll saved = payrollRepository.save(payroll);

        activityRepository.save(new Activity(employee, ActivityType.PAYROLL_UPDATED,
                "Updated payroll for " + employee.fullName() + " — net ₹" + saved.net() + "/mo"));

        return PayrollResponse.from(saved);
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }
}
