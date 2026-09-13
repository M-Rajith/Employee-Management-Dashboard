package com.peopleos.attendance.dto;

import java.util.List;

public record AttendanceSummaryResponse(
        String range,
        List<AttendanceDayResponse> days
) {
}
