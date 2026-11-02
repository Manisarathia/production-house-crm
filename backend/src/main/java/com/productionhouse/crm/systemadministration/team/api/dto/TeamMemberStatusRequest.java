package com.productionhouse.crm.systemadministration.team.api.dto;

import com.productionhouse.crm.auth.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public record TeamMemberStatusRequest(
        @NotNull UserStatus status
) {
}
