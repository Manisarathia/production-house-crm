package com.productionhouse.crm.systemadministration.team.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record ReplaceRolesRequest(
        @NotNull @Size(max = 30) Set<@jakarta.validation.constraints.NotBlank String> roles
) {
}
