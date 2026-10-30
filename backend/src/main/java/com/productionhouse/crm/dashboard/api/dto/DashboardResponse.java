package com.productionhouse.crm.dashboard.api.dto;

import java.util.List;

public record DashboardResponse(
        long totalTeamMembers,
        long activeTeamMembers,
        long inactiveTeamMembers,
        long invitedTeamMembers,
        long totalDepartments,
        List<DepartmentSummary> membersByDepartment,
        List<RoleDistribution> roleDistribution
) {
}
