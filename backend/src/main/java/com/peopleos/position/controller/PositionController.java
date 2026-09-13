package com.peopleos.position.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.position.dto.PositionRequest;
import com.peopleos.position.dto.PositionResponse;
import com.peopleos.position.service.PositionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/positions")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @GetMapping
    public ApiResponse<List<PositionResponse>> list(@RequestParam(required = false) String status) {
        return ApiResponse.ok(positionService.list(status));
    }

    @GetMapping("/{id}")
    public ApiResponse<PositionResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(positionService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PositionResponse> create(@Valid @RequestBody PositionRequest request) {
        return ApiResponse.ok("Position created successfully", positionService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PositionResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody PositionRequest request) {
        return ApiResponse.ok("Position updated successfully", positionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        positionService.delete(id);
    }
}
