package com.peopleos.employee.service;

import com.peopleos.activity.dto.ActivityResponse;
import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.attendance.entity.Attendance;
import com.peopleos.attendance.entity.AttendanceStatus;
import com.peopleos.attendance.repository.AttendanceRepository;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.dto.WorkSnapshotResponse;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.leave.entity.LeaveRequest;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.leave.repository.LeaveRequestRepository;
import com.peopleos.payroll.entity.Payroll;
import com.peopleos.payroll.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Builds the Work Snapshot dynamically from Employee + Attendance + Leave + Activity.
 * No snapshot table — the view is derived from source records on every request.
 */
@Service
public class WorkSnapshotService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ActivityRepository activityRepository;
    private final PayrollRepository payrollRepository;
    private final int annualLeaveQuota;

    public WorkSnapshotService(EmployeeRepository employeeRepository,
                               AttendanceRepository attendanceRepository,
                               LeaveRequestRepository leaveRequestRepository,
                               ActivityRepository activityRepository,
                               PayrollRepository payrollRepository,
                               @Value("${peopleos.annual-leave-quota:18}") int annualLeaveQuota) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.activityRepository = activityRepository;
        this.payrollRepository = payrollRepository;
        this.annualLeaveQuota = annualLeaveQuota;
    }

    @Transactional(readOnly = true)
    public WorkSnapshotResponse getSnapshot(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Attendance over the last 30 days — present / remote / late all count as attended.
        LocalDate since = LocalDate.now().minusDays(29);
        List<Attendance> records = attendanceRepository
                .findByEmployeeIdAndDateGreaterThanEqualOrderByDateAsc(employeeId, since);
        long attended = records.stream()
                .filter(a -> a.getStatus() != AttendanceStatus.ABSENT)
                .count();
        double attendancePercentage = Math.round((attended / 30.0) * 1000) / 10.0;

        // Approved leave days used in the current calendar year.
        int year = LocalDate.now().getYear();
        int leaveUsed = leaveRequestRepository
                .findByEmployeeIdAndStatus(employeeId, LeaveStatus.APPROVED)
                .stream()
                .filter(l -> l.getStartDate().getYear() == year)
                .mapToInt(LeaveRequest::getDuration)
                .sum();
        int leaveRemaining = Math.max(0, annualLeaveQuota - leaveUsed);

        Long netSalary = payrollRepository.findByEmployeeId(employeeId).map(Payroll::net).orElse(null);

        List<ActivityResponse> recent = activityRepository
                .findTop6ByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(ActivityResponse::from)
                .toList();

        return new WorkSnapshotResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.fullName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getRole(),
                employee.getTeam(),
                employee.getDepartment(),
                employee.getStatus(),
                employee.getLocation(),
                employee.getJoinedDate(),
                employee.getManager() != null ? employee.getManager().fullName() : "—",
                attendancePercentage,
                leaveUsed,
                leaveRemaining,
                annualLeaveQuota,
                netSalary,
                currentWorkStatus(employee),
                recent
        );
    }

    private String currentWorkStatus(Employee employee) {
        return switch (employee.getStatus()) {
            case ACTIVE -> "Working on-site today";
            case REMOTE -> "Working remotely today";
            case ON_LEAVE -> "On approved leave";
            case INACTIVE -> "Inactive";
        };
    }
}
