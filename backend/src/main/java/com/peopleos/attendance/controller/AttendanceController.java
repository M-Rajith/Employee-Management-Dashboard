package com.peopleos.attendance.controller;

import com.peopleos.attendance.dto.AttendanceSummaryResponse;
import com.peopleos.attendance.service.AttendanceService;
import com.peopleos.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /** GET /api/v1/attendance?range=week | month */
    @GetMapping
    public ApiResponse<AttendanceSummaryResponse> summary(@RequestParam(defaultValue = "week") String range) {
        if (!range.equalsIgnoreCase("week") && !range.equalsIgnoreCase("month")) {
            throw new IllegalArgumentException("range must be 'week' or 'month'");
        }
        return ApiResponse.ok(attendanceService.summary(range));
    }
}
