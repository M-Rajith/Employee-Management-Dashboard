package com.peopleos.dashboard.dto;

public record KpiDto(
        String key,
        String label,
        long value,
        long change,
        String trend,      // "up" | "down" | "flat"
        String supportingInfo
) {
}
