package com.productionhouse.crm.auth.security;

import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;

import java.util.Set;
import java.util.stream.Collectors;

public record CurrentUser(Long id, String email, String name, Set<Permission> permissions) {
    public static CurrentUser from(CrmUser user) {
        Set<Permission> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .collect(Collectors.toUnmodifiableSet());
        return new CurrentUser(user.getId(), user.getEmail(), user.getName(), permissions);
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }
}
