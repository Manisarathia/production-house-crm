package com.productionhouse.crm.systemadministration.team.api.dto;

import java.time.Instant;
import java.util.List;

public record TeamMemberResponse(
        Long id,
        String name,
        String email,
        String role,
        List<String> roles,
        String dept,
        Long departmentId,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
}
