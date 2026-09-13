package com.peopleos.dashboard.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.dashboard.service.InsightsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/insights")
public class InsightsController {

    private final InsightsService insightsService;

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping
    public ApiResponse<List<String>> insights() {
        return ApiResponse.ok(insightsService.generate());
    }
}
