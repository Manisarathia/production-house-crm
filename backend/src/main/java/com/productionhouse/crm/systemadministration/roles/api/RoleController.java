package com.productionhouse.crm.systemadministration.roles.api;

import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.roles.api.dto.RoleRequest;
import com.productionhouse.crm.systemadministration.roles.api.dto.RoleResponse;
import com.productionhouse.crm.systemadministration.roles.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public List<RoleResponse> list() {
        return roleService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public RoleResponse get(@PathVariable Long id) {
        return roleService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public RoleResponse create(
            @Valid @RequestBody RoleRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return roleService.create(request, currentUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_WRITE')")
    public RoleResponse update(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return roleService.update(id, request, currentUser);
    }
}
