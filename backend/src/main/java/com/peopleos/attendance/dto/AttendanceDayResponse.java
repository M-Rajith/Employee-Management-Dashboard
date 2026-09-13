package com.peopleos.attendance.dto;

import java.time.LocalDate;

public record AttendanceDayResponse(
        LocalDate date,
        String label,
        long present,
        long remote,
        long late,
        long absent
) {
}
