package com.productionhouse.crm.systemadministration.team.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleAssignmentRequest(
        @NotBlank @Size(max = 60) String role
) {
}
