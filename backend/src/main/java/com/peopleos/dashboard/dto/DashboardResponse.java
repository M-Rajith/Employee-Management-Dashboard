package com.peopleos.dashboard.dto;

import java.util.List;

public record DashboardResponse(
        List<KpiDto> kpis,
        List<DepartmentDistributionDto> departmentDistribution,
        long pendingLeaves
) {
}
