package com.peopleos.dashboard.controller;

import com.peopleos.common.ApiResponse;
import com.peopleos.dashboard.dto.EventResponse;
import com.peopleos.dashboard.service.EventsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventsController {

    private final EventsService eventsService;

    public EventsController(EventsService eventsService) {
        this.eventsService = eventsService;
    }

    @GetMapping
    public ApiResponse<List<EventResponse>> upcoming(@RequestParam(defaultValue = "6") int limit) {
        return ApiResponse.ok(eventsService.upcoming(Math.min(Math.max(limit, 1), 14)));
    }
}
