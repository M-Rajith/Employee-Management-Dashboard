package com.peopleos.position.service;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.position.dto.PositionRequest;
import com.peopleos.position.dto.PositionResponse;
import com.peopleos.position.entity.Position;
import com.peopleos.position.entity.PositionStatus;
import com.peopleos.position.repository.PositionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PositionService {

    private final PositionRepository positionRepository;
    private final ActivityRepository activityRepository;
    private final EmployeeRepository employeeRepository;

    public PositionService(PositionRepository positionRepository,
                           ActivityRepository activityRepository,
                           EmployeeRepository employeeRepository) {
        this.positionRepository = positionRepository;
        this.activityRepository = activityRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> list(String status) {
        return positionRepository.findAll(Sort.by(Sort.Direction.DESC, "postedDate")).stream()
                .filter(p -> status == null || status.isBlank()
                        || p.getStatus().name().equalsIgnoreCase(status))
                .map(PositionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PositionResponse get(Long id) {
        return PositionResponse.from(findById(id));
    }

    @Transactional
    public PositionResponse create(PositionRequest request) {
        Position position = new Position();
        apply(position, request);
        Position saved = positionRepository.save(position);
        log(ActivityType.POSITION_ADDED, "Opened position: " + saved.getTitle()
                + " (" + saved.getOpenings() + " opening(s), " + saved.getLocation() + ")");
        return PositionResponse.from(saved);
    }

    @Transactional
    public PositionResponse update(Long id, PositionRequest request) {
        Position position = findById(id);
        apply(position, request);
        Position saved = positionRepository.save(position);
        log(ActivityType.POSITION_UPDATED, "Updated position: " + saved.getTitle()
                + " — now " + saved.getStatus());
        return PositionResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Position position = findById(id);
        positionRepository.delete(position);
        log(ActivityType.POSITION_UPDATED, "Removed position: " + position.getTitle());
    }

    public long countOpen() {
        return positionRepository.countByStatus(PositionStatus.OPEN);
    }

    private void apply(Position position, PositionRequest request) {
        position.setTitle(request.title());
        position.setDepartment(request.department());
        position.setLocation(request.location());
        position.setStatus(request.status());
        position.setOpenings(request.openings());
        position.setPostedDate(request.postedDate());
        position.setNotes(request.notes());
    }

    private Position findById(Long id) {
        return positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found"));
    }

    /** Activity feed entries are tied to an employee; use any existing one as the actor. */
    private void log(ActivityType type, String message) {
        List<Employee> any = employeeRepository.findAll(PageRequest.of(0, 1)).getContent();
        if (!any.isEmpty()) {
            activityRepository.save(new Activity(any.get(0), type, message));
        }
    }
}
