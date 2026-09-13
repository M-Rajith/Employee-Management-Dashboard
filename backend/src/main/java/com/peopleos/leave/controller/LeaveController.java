package com.peopleos.leave.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.leave.dto.LeaveRequestResponse;
import com.peopleos.leave.service.LeaveService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping("/pending")
    public ApiResponse<List<LeaveRequestResponse>> pending() {
        return ApiResponse.ok(leaveService.pending());
    }

    @PutMapping("/{id}/approve")
    public ApiResponse<LeaveRequestResponse> approve(@PathVariable Long id) {
        return ApiResponse.ok("Leave approved", leaveService.approve(id));
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<LeaveRequestResponse> reject(@PathVariable Long id) {
        return ApiResponse.ok("Leave rejected", leaveService.reject(id));
    }
}
