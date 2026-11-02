package com.productionhouse.crm.systemadministration.roles.api.dto;

import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record RoleRequest(
        @NotBlank @Size(max = 60) String name,
        @Size(max = 250) String description,
        @NotNull Set<Permission> permissions
) {
}
