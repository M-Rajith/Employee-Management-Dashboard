package com.peopleos.activity.controller;

import com.peopleos.activity.dto.ActivityResponse;
import com.peopleos.activity.service.ActivityService;
import com.peopleos.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ApiResponse<List<ActivityResponse>> recent() {
        return ApiResponse.ok(activityService.recent());
    }
}
