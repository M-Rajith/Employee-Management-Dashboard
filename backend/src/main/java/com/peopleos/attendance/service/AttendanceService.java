package com.peopleos.attendance.service;

import com.peopleos.attendance.dto.AttendanceDayResponse;
import com.peopleos.attendance.dto.AttendanceRecordResponse;
import com.peopleos.attendance.dto.AttendanceSummaryResponse;
import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;
import com.peopleos.attendance.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private static final DateTimeFormatter LABEL = DateTimeFormatter.ofPattern("EEE, d MMM");

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    /** range = "week" (last 7 days) or "month" (last 30 days). */
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse summary(String range) {
        int days = "week".equalsIgnoreCase(range) ? 7 : 30;
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days - 1);

        Map<LocalDate, Map<AttendanceStatus, Long>> byDate = attendanceRepository
                .findByDateBetween(start, today)
                .stream()
                .collect(Collectors.groupingBy(
                        Attendance::getDate,
                        Collectors.groupingBy(
                                Attendance::getStatus,
                                () -> new EnumMap<>(AttendanceStatus.class),
                                Collectors.counting())));

        List<AttendanceDayResponse> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            Map<AttendanceStatus, Long> counts = byDate.getOrDefault(date, Map.of());
            result.add(new AttendanceDayResponse(
                    date,
                    date.format(LABEL),
                    counts.getOrDefault(AttendanceStatus.PRESENT, 0L),
                    counts.getOrDefault(AttendanceStatus.REMOTE, 0L),
                    counts.getOrDefault(AttendanceStatus.LATE, 0L),
                    counts.getOrDefault(AttendanceStatus.ABSENT, 0L)
            ));
        }
        return new AttendanceSummaryResponse("week".equalsIgnoreCase(range) ? "week" : "month", result);
    }

    public long countByStatus(LocalDate date, AttendanceStatus status) {
        return attendanceRepository.countByDateAndStatus(date, status);
    }

    /** Date-wise attendance for one employee: week = last 7 days, anything else = last 30. */
    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> employeeHistory(Long employeeId, String range) {
        int days = "week".equalsIgnoreCase(range) ? 7 : 30;
        return attendanceRepository
                .findByEmployeeIdAndDateGreaterThanEqualOrderByDateAsc(employeeId, LocalDate.now().minusDays(days - 1))
                .stream()
                .map(AttendanceRecordResponse::from)
                .toList();
    }
}
