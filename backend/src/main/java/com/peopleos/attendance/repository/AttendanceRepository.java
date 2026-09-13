package com.peopleos.attendance.repository;

import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    List<Attendance> findByDateBetween(LocalDate start, LocalDate end);

    List<Attendance> findByEmployeeIdAndDateGreaterThanEqualOrderByDateAsc(Long employeeId, LocalDate date);

    List<Attendance> findByDateGreaterThanEqual(LocalDate date);
}
