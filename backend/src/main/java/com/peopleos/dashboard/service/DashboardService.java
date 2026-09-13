package com.peopleos.dashboard.service;

import com.peopleos.attendance.entity.AttendanceStatus;
import com.peopleos.attendance.service.AttendanceService;
import com.peopleos.dashboard.dto.DashboardResponse;
import com.peopleos.dashboard.dto.DepartmentDistributionDto;
import com.peopleos.dashboard.dto.KpiDto;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.position.entity.PositionStatus;
import com.peopleos.position.repository.PositionRepository;
import com.peopleos.leave.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * All dashboard metrics are derived from source records (employees, attendance,
 * leave) on every request — nothing is duplicated in a metrics table.
 */
@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceService attendanceService;
    private final PositionRepository positionRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                            LeaveRequestRepository leaveRequestRepository,
                            AttendanceService attendanceService,
                            PositionRepository positionRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceService = attendanceService;
        this.positionRepository = positionRepository;
    }

    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());

        long total = employeeRepository.count();
        long newHiresThisMonth = employeeRepository.countByJoinedDateAfter(monthStart.minusDays(1));

        long present = attendanceService.countByStatus(today, AttendanceStatus.PRESENT)
                + attendanceService.countByStatus(today, AttendanceStatus.LATE);
        long presentYesterday = attendanceService.countByStatus(yesterday, AttendanceStatus.PRESENT)
                + attendanceService.countByStatus(yesterday, AttendanceStatus.LATE);

        long remote = attendanceService.countByStatus(today, AttendanceStatus.REMOTE);
        long remoteYesterday = attendanceService.countByStatus(yesterday, AttendanceStatus.REMOTE);

        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
        long openPositions = positionRepository.countByStatus(PositionStatus.OPEN);

        List<KpiDto> kpis = List.of(
                new KpiDto("totalEmployees", "Total Employees", total, newHiresThisMonth,
                        newHiresThisMonth > 0 ? "up" : "flat", newHiresThisMonth + " new this month"),
                new KpiDto("presentToday", "Present Today", present, present - presentYesterday,
                        trend(present - presentYesterday), "vs yesterday"),
                new KpiDto("onLeave", "On Leave", onLeave, pendingLeaves,
                        pendingLeaves > 0 ? "up" : "flat", pendingLeaves + " pending requests"),
                new KpiDto("remoteToday", "Remote Today", remote, remote - remoteYesterday,
                        trend(remote - remoteYesterday), "vs yesterday"),
                new KpiDto("openPositions", "Open Positions", openPositions, 0, "flat",
                        openPositions > 0 ? "actively hiring — tap to manage" : "add roles below")
        );

        return new DashboardResponse(kpis, departmentDistribution(), pendingLeaves);
    }

    public List<DepartmentDistributionDto> departmentDistribution() {
        long total = employeeRepository.count();
        if (total == 0) return List.of();
        return employeeRepository.countByDepartment().stream()
                .map(row -> {
                    Department dept = (Department) row[0];
                    long count = (Long) row[1];
                    double pct = Math.round((count * 1000.0 / total)) / 10.0;
                    return new DepartmentDistributionDto(dept, count, pct);
                })
                .sorted(Comparator.comparingLong(DepartmentDistributionDto::count).reversed())
                .collect(Collectors.toList());
    }

    private String trend(long change) {
        if (change > 0) return "up";
        if (change < 0) return "down";
        return "flat";
    }
}
