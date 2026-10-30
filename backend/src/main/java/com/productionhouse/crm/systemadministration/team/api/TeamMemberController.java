package com.productionhouse.crm.systemadministration.team.api;

import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.team.api.dto.CreateTeamMemberRequest;
import com.productionhouse.crm.systemadministration.team.api.dto.CreatedTeamMemberResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.PageResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.ReplaceRolesRequest;
import com.productionhouse.crm.systemadministration.team.api.dto.RoleAssignmentRequest;
import com.productionhouse.crm.systemadministration.team.api.dto.TeamMemberResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.TeamMemberStatusRequest;
import com.productionhouse.crm.systemadministration.team.api.dto.UpdateTeamMemberRequest;
import com.productionhouse.crm.systemadministration.team.service.TeamMemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class TeamMemberController {
    private final TeamMemberService teamMemberService;

    public TeamMemberController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public PageResponse<TeamMemberResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return teamMemberService.list(q, status, departmentId, role, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public TeamMemberResponse get(@PathVariable Long id) {
        return teamMemberService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public CreatedTeamMemberResponse create(
            @Valid @RequestBody CreateTeamMemberRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return teamMemberService.create(request, currentUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public TeamMemberResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeamMemberRequest request
    ) {
        return teamMemberService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public TeamMemberResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TeamMemberStatusRequest request
    ) {
        return teamMemberService.updateStatus(id, request.status());
    }

    @GetMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_READ')")
    public List<String> listRoles(@PathVariable Long id) {
        return teamMemberService.listUserRoles(id);
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public List<String> addRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleAssignmentRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return teamMemberService.addRole(id, request.role(), currentUser);
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public List<String> replaceRoles(
            @PathVariable Long id,
            @Valid @RequestBody ReplaceRolesRequest request,
            @AuthenticationPrincipal CurrentUser currentUser
    ) {
        return teamMemberService.replaceRoles(id, request.roles(), currentUser);
    }

    @DeleteMapping("/{id}/roles/{role}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('USER_WRITE')")
    public void removeRole(@PathVariable Long id, @PathVariable String role) {
        teamMemberService.removeRole(id, role);
    }
}
