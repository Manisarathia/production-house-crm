package com.productionhouse.crm.systemadministration.roles.api.dto;

import com.productionhouse.crm.systemadministration.roles.entity.Permission;

import java.util.List;

public record RoleResponse(
        Long id,
        String name,
        String description,
        List<Permission> permissions
) {
}
