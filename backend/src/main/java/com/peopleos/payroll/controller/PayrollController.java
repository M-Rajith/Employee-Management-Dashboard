package com.peopleos.payroll.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.payroll.dto.PayrollRequest;
import com.peopleos.payroll.dto.PayrollResponse;
import com.peopleos.payroll.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/payroll")
    public ApiResponse<List<PayrollResponse>> list() {
        return ApiResponse.ok(payrollService.list());
    }

    @GetMapping("/employees/{employeeId}/payroll")
    public ApiResponse<PayrollResponse> getForEmployee(@PathVariable Long employeeId) {
        return ApiResponse.ok(payrollService.getForEmployee(employeeId));
    }

    @PutMapping("/employees/{employeeId}/payroll")
    public ApiResponse<PayrollResponse> upsert(@PathVariable Long employeeId,
                                               @Valid @RequestBody PayrollRequest request) {
        return ApiResponse.ok("Payroll saved", payrollService.upsert(employeeId, request));
    }
}
