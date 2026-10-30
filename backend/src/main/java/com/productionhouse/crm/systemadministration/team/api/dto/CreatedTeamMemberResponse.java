package com.productionhouse.crm.systemadministration.team.api.dto;

public record CreatedTeamMemberResponse(
        Long id,
        String name,
        String email,
        String role,
        java.util.List<String> roles,
        String dept,
        Long departmentId,
        String status,
        java.time.Instant createdAt,
        java.time.Instant updatedAt,
        String invitationToken
) {
}
