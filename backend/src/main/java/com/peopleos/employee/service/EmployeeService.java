package com.peopleos.employee.service;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.common.PageResponse;
import com.peopleos.common.exception.DuplicateResourceException;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.dto.EmployeeRequest;
import com.peopleos.employee.dto.EmployeeResponse;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ActivityRepository activityRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           ActivityRepository activityRepository) {
        this.employeeRepository = employeeRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> list(String search, String department, String status,
                                               String location, String team, int page, int size, String sort) {
        Specification<Employee> spec = buildFilter(search, department, status, location, team);
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        Page<Employee> result = employeeRepository.findAll(spec, pageable);
        return PageResponse.from(result, EmployeeResponse::from);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long id) {
        return EmployeeResponse.from(findById(id));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.email().toLowerCase())) {
            throw new DuplicateResourceException("An employee with this email already exists");
        }
        if (employeeRepository.existsByEmployeeCode(request.employeeCode())) {
            throw new DuplicateResourceException("An employee with this code already exists");
        }

        Employee employee = new Employee();
        applyRequest(employee, request);
        Employee saved = employeeRepository.save(employee);

        activityRepository.save(new Activity(
                saved, ActivityType.EMPLOYEE_ADDED,
                "Added employee " + saved.fullName() + " (" + saved.getEmployeeCode() + ")"));

        return EmployeeResponse.from(saved);
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = findById(id);

        if (employeeRepository.existsByEmailAndIdNot(request.email().toLowerCase(), id)) {
            throw new DuplicateResourceException("An employee with this email already exists");
        }
        if (employeeRepository.existsByEmployeeCodeAndIdNot(request.employeeCode(), id)) {
            throw new DuplicateResourceException("An employee with this code already exists");
        }

        applyRequest(employee, request);
        Employee saved = employeeRepository.save(employee);

        activityRepository.save(new Activity(
                saved, ActivityType.EMPLOYEE_UPDATED,
                "Updated profile for " + saved.fullName()));

        return EmployeeResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = findById(id);
        employeeRepository.delete(employee);
        activityRepository.save(new Activity(
                employee, ActivityType.EMPLOYEE_REMOVED,
                "Removed employee " + employee.fullName() + " (" + employee.getEmployeeCode() + ")"));
    }

    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private void applyRequest(Employee employee, EmployeeRequest request) {
        employee.setEmployeeCode(request.employeeCode());
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email().toLowerCase());
        employee.setPhone(request.phone());
        employee.setDepartment(request.department());
        employee.setRole(request.role());
        employee.setTeam(request.team());
        employee.setStatus(request.status());
        employee.setLocation(request.location());
        employee.setJoinedDate(request.joinedDate());
        if (request.managerId() != null) {
            employee.setManager(findById(request.managerId()));
        } else {
            employee.setManager(null);
        }
    }

    private Specification<Employee> buildFilter(String search, String department, String status, String location, String team) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                // Tokenized search: every word must match at least one field,
                // so full names ("Arjun Kumar") and multi-word queries work.
                for (String token : search.toLowerCase().split("\\s+")) {
                    if (token.isBlank()) continue;
                    String like = "%" + token + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("firstName")), like),
                            cb.like(cb.lower(root.get("lastName")), like),
                            cb.like(cb.lower(root.get("email")), like),
                            cb.like(cb.lower(root.get("role")), like)
                    ));
                }
            }
            if (department != null && !department.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("department")), department.toUpperCase()));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
            }
            if (team != null && !team.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("team")), team.toUpperCase()));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "firstName");
        }
        String[] parts = sort.split(",");
        String field = switch (parts[0]) {
            case "name" -> "firstName";
            case "joinedDate" -> "joinedDate";
            case "department" -> "department";
            case "status" -> "status";
            case "lastName" -> "lastName";
            default -> "firstName";
        };
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("desc")
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }
}
