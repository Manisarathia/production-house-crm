package com.productionhouse.crm.systemadministration.roles.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.roles.api.dto.RoleRequest;
import com.productionhouse.crm.systemadministration.roles.api.dto.RoleResponse;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Locale;
import java.util.Set;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public java.util.List<RoleResponse> list() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(Role::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse get(Long id) {
        return toResponse(findRole(id));
    }

    @Transactional
    public RoleResponse create(RoleRequest request, CurrentUser actor) {
        String name = normalizeName(request.name());
        if (roleRepository.existsByNameIgnoreCase(name)) {
            throw ApiException.conflict("A role with this name already exists.");
        }
        requireGrantablePermissions(request.permissions(), actor);
        Role role = new Role(name, cleanDescription(request.description()), request.permissions());
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, RoleRequest request, CurrentUser actor) {
        Role role = findRole(id);
        String name = normalizeName(request.name());
        if (roleRepository.findByNameIgnoreCase(name)
                .filter(existing -> !existing.getId().equals(id))
                .isPresent()) {
            throw ApiException.conflict("A role with this name already exists.");
        }
        requireGrantablePermissions(request.permissions(), actor);
        if ("ADMIN".equals(role.getName()) && !request.permissions().containsAll(Arrays.asList(Permission.values()))) {
            throw ApiException.badRequest("The ADMIN role must retain every system permission.");
        }
        role.setName(name);
        role.setDescription(cleanDescription(request.description()));
        role.setPermissions(request.permissions());
        return toResponse(role);
    }

    @Transactional(readOnly = true)
    public Role findByName(String name) {
        return roleRepository.findByNameIgnoreCase(normalizeName(name))
                .orElseThrow(() -> ApiException.badRequest("Role does not exist."));
    }

    private Role findRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Role not found."));
    }

    private void requireGrantablePermissions(Set<Permission> permissions, CurrentUser actor) {
        if (!actor.permissions().containsAll(permissions)) {
            throw ApiException.forbidden("You cannot grant permissions you do not have.");
        }
    }

    private String normalizeName(String name) {
        String normalized = name.trim().toUpperCase(Locale.ROOT).replaceAll("[\\s-]+", "_");
        if (!normalized.matches("[A-Z][A-Z0-9_]{1,59}")) {
            throw ApiException.badRequest("Role names must start with a letter and contain only letters, numbers, spaces, underscores, or hyphens.");
        }
        return normalized;
    }

    private String cleanDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    private RoleResponse toResponse(Role role) {
        return new RoleResponse(role.getId(), displayName(role.getName()), role.getDescription(),
                role.getPermissions().stream().sorted().toList());
    }

    public static String displayName(String name) {
        return Arrays.stream(name.toLowerCase(Locale.ROOT).split("_"))
                .filter(part -> !part.isBlank())
                .map(part -> part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1))
                .collect(java.util.stream.Collectors.joining(" "));
    }
}
