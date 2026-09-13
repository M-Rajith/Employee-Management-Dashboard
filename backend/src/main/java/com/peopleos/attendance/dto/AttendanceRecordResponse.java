package com.peopleos.attendance.dto;

import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/** One day of attendance for one employee (date-wise history). */
public record AttendanceRecordResponse(
        LocalDate date,
        String label,
        AttendanceStatus status
) {
    private static final DateTimeFormatter LABEL = DateTimeFormatter.ofPattern("EEE, d MMM");

    public static AttendanceRecordResponse from(Attendance a) {
        return new AttendanceRecordResponse(a.getDate(), a.getDate().format(LABEL), a.getStatus());
    }
}
