package com.peopleos.project.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.project.dto.AddMemberRequest;
import com.peopleos.project.dto.ProjectRequest;
import com.peopleos.project.dto.ProjectResponse;
import com.peopleos.project.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ApiResponse<List<ProjectResponse>> list() {
        return ApiResponse.ok(projectService.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(projectService.get(id));
    }

    /** Create a project; the team is auto-assembled from experience + weightage. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        return ApiResponse.ok("Project created — team assembled", projectService.create(request));
    }

    @PostMapping("/{id}/members")
    public ApiResponse<ProjectResponse> addMember(@PathVariable Long id,
                                                  @Valid @RequestBody AddMemberRequest request) {
        return ApiResponse.ok("Member added", projectService.addMember(id, request));
    }

    @DeleteMapping("/{id}/members/{employeeId}")
    public ApiResponse<ProjectResponse> removeMember(@PathVariable Long id,
                                                     @PathVariable Long employeeId) {
        return ApiResponse.ok("Member removed", projectService.removeMember(id, employeeId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }
}
