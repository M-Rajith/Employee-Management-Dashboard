package com.peopleos.leave.service;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.leave.dto.LeaveRequestResponse;
import com.peopleos.leave.entity.LeaveRequest;
import com.peopleos.leave.entity.LeaveStatus;
import com.peopleos.leave.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final ActivityRepository activityRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        ActivityRepository activityRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> pending() {
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING)
                .stream().map(LeaveRequestResponse::from).toList();
    }

    @Transactional
    public LeaveRequestResponse approve(Long id) {
        LeaveRequest leave = findPending(id);
        leave.setStatus(LeaveStatus.APPROVED);
        leaveRequestRepository.save(leave);

        // If the approved leave covers today, reflect it on the employee's work status.
        if (leave.covers(LocalDate.now()) && leave.getEmployee().getStatus() == EmployeeStatus.ACTIVE) {
            leave.getEmployee().setStatus(EmployeeStatus.ON_LEAVE);
        }

        activityRepository.save(new Activity(
                leave.getEmployee(), ActivityType.LEAVE_APPROVED,
                "Leave approved for " + leave.getEmployee().fullName()
                        + " (" + leave.getLeaveType() + ", " + leave.getDuration() + "d)"));

        return LeaveRequestResponse.from(leave);
    }

    @Transactional
    public LeaveRequestResponse reject(Long id) {
        LeaveRequest leave = findPending(id);
        leave.setStatus(LeaveStatus.REJECTED);
        leaveRequestRepository.save(leave);

        activityRepository.save(new Activity(
                leave.getEmployee(), ActivityType.LEAVE_REJECTED,
                "Leave rejected for " + leave.getEmployee().fullName()
                        + " (" + leave.getLeaveType() + ", " + leave.getDuration() + "d)"));

        return LeaveRequestResponse.from(leave);
    }

    public long pendingCount() {
        return leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
    }

    private LeaveRequest findPending(Long id) {
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("This leave request has already been " + leave.getStatus().name().toLowerCase());
        }
        return leave;
    }
}
