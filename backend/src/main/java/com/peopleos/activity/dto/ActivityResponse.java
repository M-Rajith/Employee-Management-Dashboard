package com.peopleos.activity.dto;

import com.peopleos.activity.entity.Activity;
import com.peopleos.activity.entity.ActivityType;

import java.time.LocalDateTime;

public record ActivityResponse(
        Long id,
        Long employeeId,
        String employeeName,
        ActivityType activityType,
        String message,
        LocalDateTime createdAt
) {
    public static ActivityResponse from(Activity a) {
        return new ActivityResponse(
                a.getId(),
                a.getEmployee().getId(),
                a.getEmployee().fullName(),
                a.getActivityType(),
                a.getMessage(),
                a.getCreatedAt()
        );
    }
}
