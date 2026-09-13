package com.peopleos.dashboard.dto;

import java.time.LocalDate;

public record EventResponse(
        String name,
        LocalDate date,
        String label,
        long daysUntil
) {
}
