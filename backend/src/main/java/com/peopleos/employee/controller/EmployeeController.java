package com.peopleos.employee.controller;

import com.peopleos.attendance.dto.AttendanceRecordResponse;
import com.peopleos.attendance.service.AttendanceService;
import com.peopleos.common.ApiResponse;
import com.peopleos.common.PageResponse;
import com.peopleos.employee.dto.EmployeeRequest;
import com.peopleos.employee.dto.EmployeeResponse;
import com.peopleos.employee.dto.WorkSnapshotResponse;
import com.peopleos.employee.service.EmployeeService;
import com.peopleos.employee.service.WorkSnapshotService;
import jakarta.validation.Valid;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final WorkSnapshotService workSnapshotService;
    private final AttendanceService attendanceService;

    public EmployeeController(EmployeeService employeeService,
                              WorkSnapshotService workSnapshotService,
                              AttendanceService attendanceService) {
        this.employeeService = employeeService;
        this.workSnapshotService = workSnapshotService;
        this.attendanceService = attendanceService;
    }

    /** GET /api/v1/employees?search=&department=&status=&location=&page=&size=&sort= */
    @GetMapping
    public ApiResponse<PageResponse<EmployeeResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String team,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName,asc") String sort) {

        size = Math.min(size, 100); // guard against unbounded pages
        return ApiResponse.ok(employeeService.list(search, department, status, location, team, page, size, sort));
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(employeeService.get(id));
    }

    /** Work Snapshot — identity + attendance + leave + activity, generated dynamically. */
    @GetMapping("/{id}/snapshot")
    public ApiResponse<WorkSnapshotResponse> snapshot(@PathVariable Long id) {
        return ApiResponse.ok(workSnapshotService.getSnapshot(id));
    }

    /** Date-wise attendance for one employee: GET /api/v1/employees/{id}/attendance?range=week|month */
    @GetMapping("/{id}/attendance")
    public ApiResponse<List<AttendanceRecordResponse>> attendance(@PathVariable Long id,
                                                                  @RequestParam(defaultValue = "month") String range) {
        employeeService.get(id); // 404 if the employee does not exist
        return ApiResponse.ok(attendanceService.employeeHistory(id, range));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.ok("Employee created successfully", employeeService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EmployeeResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.ok("Employee updated successfully", employeeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        employeeService.delete(id);
    }
}
