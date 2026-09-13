package com.peopleos.project.service;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;
import com.peopleos.activity.repository.ActivityRepository;
import com.peopleos.common.exception.DuplicateResourceException;
import com.peopleos.common.exception.ResourceNotFoundException;
import com.peopleos.employee.entity.Department;
import com.peopleos.employee.entity.Employee;
import com.peopleos.employee.entity.EmployeeStatus;
import com.peopleos.employee.repository.EmployeeRepository;
import com.peopleos.project.dto.AddMemberRequest;
import com.peopleos.project.dto.ProjectMemberResponse;
import com.peopleos.project.dto.ProjectRequest;
import com.peopleos.project.dto.ProjectResponse;
import com.peopleos.project.entity.Project;
import com.peopleos.project.entity.ProjectMember;
import com.peopleos.project.entity.ProjectWeightage;
import com.peopleos.project.repository.ProjectMemberRepository;
import com.peopleos.project.repository.ProjectRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityRepository activityRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository memberRepository,
                          EmployeeRepository employeeRepository,
                          ActivityRepository activityRepository) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.employeeRepository = employeeRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list() {
        return projectRepository.findAll().stream()
                .sorted(Comparator.comparing(Project::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse get(Long id) {
        return toResponse(findProject(id));
    }

    /**
     * Create a project and auto-assemble a complete team from employee experience.
     * LOW = 3 people, MEDIUM = 5 (+ product & design), HIGH = 7 (senior-heavy).
     */
    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        if (projectRepository.existsByName(request.name().trim())) {
            throw new DuplicateResourceException("A project with this name already exists");
        }
        Project project = new Project();
        project.setName(request.name().trim());
        project.setWeightage(request.weightage());
        Project saved = projectRepository.save(project);

        List<ProjectMember> team = assembleTeam(saved);
        memberRepository.saveAll(team);

        log(ActivityType.PROJECT_CREATED, "Created project " + saved.getName()
                + " (" + saved.getWeightage() + ") — assembled a " + team.size() + "-person team");
        return toResponse(saved);
    }

    @Transactional
    public ProjectResponse addMember(Long projectId, AddMemberRequest request) {
        Project project = findProject(projectId);
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (memberRepository.existsByProjectIdAndEmployeeId(projectId, employee.getId())) {
            throw new DuplicateResourceException(employee.fullName() + " is already on this project");
        }
        boolean hasLead = memberRepository.findByProjectId(projectId).stream()
                .anyMatch(m -> "Lead".equals(m.getMemberRole()));
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setEmployee(employee);
        member.setMemberRole(hasLead ? tierFor(employee) : "Lead");
        memberRepository.save(member);

        log(ActivityType.PROJECT_MEMBER_ADDED, "Added " + employee.fullName()
                + " to " + project.getName() + " as " + member.getMemberRole());
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse removeMember(Long projectId, Long employeeId) {
        Project project = findProject(projectId);
        if (!memberRepository.existsByProjectIdAndEmployeeId(projectId, employeeId)) {
            throw new ResourceNotFoundException("That employee is not on this project");
        }
        memberRepository.deleteByProjectIdAndEmployeeId(projectId, employeeId);
        log(ActivityType.PROJECT_MEMBER_REMOVED, "Removed a member from " + project.getName());
        return toResponse(project);
    }

    @Transactional
    public void delete(Long id) {
        Project project = findProject(id);
        projectRepository.delete(project); // members cascade
        log(ActivityType.PROJECT_MEMBER_REMOVED, "Deleted project " + project.getName());
    }

    // ---------- team assembly ----------

    /** Working pool (ACTIVE/REMOTE), most experienced first. */
    private List<Employee> poolByExperience() {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE
                        || e.getStatus() == EmployeeStatus.REMOTE)
                .sorted(Comparator.comparing(Employee::getJoinedDate))
                .toList();
    }

    private List<ProjectMember> assembleTeam(Project project) {
        List<Employee> pool = poolByExperience();
        int size = switch (project.getWeightage()) {
            case LOW -> 3;
            case MEDIUM -> 5;
            case HIGH -> 7;
        };
        boolean withSupport = project.getWeightage() != ProjectWeightage.LOW;
        int engineerSlots = size - 1 - (withSupport ? 2 : 0);

        List<Employee> engineers = pool.stream()
                .filter(e -> e.getDepartment() == Department.ENGINEERING)
                .toList();
        List<Employee> chosen = new ArrayList<>();
        engineers.stream().limit(1 + Math.max(0, engineerSlots)).forEach(chosen::add); // lead + engineers
        if (withSupport) {
            pool.stream().filter(e -> e.getDepartment() == Department.PRODUCT
                    && !chosen.contains(e)).findFirst().ifPresent(chosen::add);
            pool.stream().filter(e -> e.getDepartment() == Department.DESIGN
                    && !chosen.contains(e)).findFirst().ifPresent(chosen::add);
        }

        Employee lead = chosen.isEmpty() ? null : chosen.get(0);
        return chosen.stream().map(e -> {
            ProjectMember m = new ProjectMember();
            m.setProject(project);
            m.setEmployee(e);
            m.setMemberRole(e.equals(lead) ? "Lead" : tierFor(e));
            return m;
        }).toList();
    }

    /** Seniority tier from tenure: >= 6y Senior, >= 3y Engineer, else Junior. */
    private String tierFor(Employee e) {
        double years = ChronoUnit.MONTHS.between(e.getJoinedDate(), LocalDate.now()) / 12.0;
        if (years >= 6) return "Senior";
        if (years >= 3) return "Engineer";
        return "Junior";
    }

    // ---------- helpers ----------

    private ProjectResponse toResponse(Project project) {
        List<ProjectMemberResponse> members = memberRepository.findByProjectId(project.getId())
                .stream().map(ProjectMemberResponse::from).toList();
        return new ProjectResponse(project.getId(), project.getName(), project.getWeightage(),
                project.getCreatedAt(), members);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private void log(ActivityType type, String message) {
        List<Employee> any = employeeRepository.findAll(PageRequest.of(0, 1)).getContent();
        if (!any.isEmpty()) {
            activityRepository.save(new Activity(any.get(0), type, message));
        }
    }
}
