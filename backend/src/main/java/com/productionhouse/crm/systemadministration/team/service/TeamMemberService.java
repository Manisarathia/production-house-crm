package com.productionhouse.crm.systemadministration.team.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.auth.service.AuthService;
import com.productionhouse.crm.systemadministration.department.entity.Department;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentRepository;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.service.RoleService;
import com.productionhouse.crm.systemadministration.team.api.dto.CreateTeamMemberRequest;
import com.productionhouse.crm.systemadministration.team.api.dto.CreatedTeamMemberResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.PageResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.TeamMemberResponse;
import com.productionhouse.crm.systemadministration.team.api.dto.UpdateTeamMemberRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TeamMemberService {
    private static final String DEFAULT_ROLE = "EDITOR";
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleService roleService;
    private final AuthService authService;

    public TeamMemberService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            RoleService roleService,
            AuthService authService
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleService = roleService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public PageResponse<TeamMemberResponse> list(
            String search,
            String status,
            Long departmentId,
            String role,
            int page,
            int size
    ) {
        if (page < 0 || size < 1 || size > 100) {
            throw ApiException.badRequest("Page must be non-negative and size must be between 1 and 100.");
        }
        UserStatus parsedStatus = parseStatus(status);
        Page<CrmUser> users = userRepository.search(
                cleanSearch(search),
                parsedStatus,
                departmentId,
                cleanRole(role),
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"))
        );
        return PageResponse.from(users.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public TeamMemberResponse get(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public CreatedTeamMemberResponse create(CreateTeamMemberRequest request, CurrentUser actor) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("A team member with this email already exists.");
        }
        Role role = roleService.findByName(request.role() == null || request.role().isBlank()
                ? DEFAULT_ROLE : request.role());
        requireGrantableRole(role, actor);
        Department department = findDepartment(request.departmentId());
        String rawInvitationToken = authService.createInvitationToken();
        CrmUser user = new CrmUser(request.name().trim(), email, null, UserStatus.INVITED);
        user.setDepartment(department);
        user.setRoles(Set.of(role));
        user.setInvitationTokenHash(authService.hashToken(rawInvitationToken));
        user.setInvitationExpiresAt(Instant.now().plusSeconds(48 * 60 * 60));
        user = userRepository.save(user);
        TeamMemberResponse response = toResponse(user);
        return new CreatedTeamMemberResponse(
                response.id(), response.name(), response.email(), response.role(), response.roles(),
                response.dept(), response.departmentId(), response.status(), response.createdAt(),
                response.updatedAt(), rawInvitationToken
        );
    }

    @Transactional
    public TeamMemberResponse update(Long id, UpdateTeamMemberRequest request) {
        CrmUser user = findUser(id);
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw ApiException.conflict("A team member with this email already exists.");
                });
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setDepartment(findDepartment(request.departmentId()));
        return toResponse(user);
    }

    @Transactional
    public TeamMemberResponse updateStatus(Long id, UserStatus status) {
        if (status == UserStatus.INVITED) {
            throw ApiException.badRequest("Status can only be ACTIVE or INACTIVE.");
        }
        CrmUser user = findUser(id);
        boolean isAdministrator = user.getRoles().stream()
                .anyMatch(role -> ADMIN_ROLE.equals(role.getName()));
        if (status == UserStatus.INACTIVE && user.getStatus() == UserStatus.ACTIVE && isAdministrator
                && userRepository.countUsersWithRoleAndStatus(ADMIN_ROLE, UserStatus.ACTIVE) <= 1) {
            throw ApiException.conflict("The last active administrator cannot be deactivated.");
        }
        if (status == UserStatus.ACTIVE && user.getPasswordHash() == null) {
            throw ApiException.conflict("The user must accept the invitation before activation.");
        }
        if (user.getStatus() != status) {
            user.setStatus(status);
            if (status == UserStatus.INACTIVE) {
                user.incrementTokenVersion();
            }
        }
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<String> listUserRoles(Long userId) {
        return findUser(userId).getRoles().stream()
                .map(Role::getName)
                .sorted()
                .map(RoleService::displayName)
                .toList();
    }

    @Transactional
    public List<String> addRole(Long userId, String roleName, CurrentUser actor) {
        CrmUser user = findUser(userId);
        Role role = roleService.findByName(roleName);
        requireGrantableRole(role, actor);
        Set<Role> updatedRoles = new LinkedHashSet<>(user.getRoles());
        updatedRoles.add(role);
        user.setRoles(updatedRoles);
        return listUserRoles(userId);
    }

    @Transactional
    public List<String> replaceRoles(Long userId, Set<String> roleNames, CurrentUser actor) {
        CrmUser user = findUser(userId);
        Set<Role> roles = new LinkedHashSet<>();
        for (String name : roleNames) {
            Role role = roleService.findByName(name);
            requireGrantableRole(role, actor);
            roles.add(role);
        }
        preventLastAdminRemoval(user, roles);
        user.setRoles(roles);
        return roles.stream().map(Role::getName).sorted().map(RoleService::displayName).toList();
    }

    @Transactional
    public List<String> removeRole(Long userId, String roleName) {
        CrmUser user = findUser(userId);
        Role role = roleService.findByName(roleName);
        if (ADMIN_ROLE.equals(role.getName()) && user.getRoles().contains(role)) {
            long activeAdmins = userRepository.countUsersWithRoleAndStatus(ADMIN_ROLE, UserStatus.ACTIVE);
            if (user.getStatus() == UserStatus.ACTIVE && activeAdmins <= 1) {
                throw ApiException.conflict("The last active administrator cannot be removed.");
            }
        }
        Set<Role> updatedRoles = new LinkedHashSet<>(user.getRoles());
        updatedRoles.remove(role);
        user.setRoles(updatedRoles);
        return listUserRoles(userId);
    }

    private void preventLastAdminRemoval(CrmUser user, Set<Role> newRoles) {
        boolean currentlyAdmin = user.getRoles().stream().anyMatch(role -> ADMIN_ROLE.equals(role.getName()));
        boolean remainsAdmin = newRoles.stream().anyMatch(role -> ADMIN_ROLE.equals(role.getName()));
        if (currentlyAdmin && !remainsAdmin && user.getStatus() == UserStatus.ACTIVE
                && userRepository.countUsersWithRoleAndStatus(ADMIN_ROLE, UserStatus.ACTIVE) <= 1) {
            throw ApiException.conflict("The last active administrator cannot be removed.");
        }
    }

    private void requireGrantableRole(Role role, CurrentUser actor) {
        if (!actor.permissions().containsAll(role.getPermissions())) {
            throw ApiException.forbidden("You cannot assign a role with permissions you do not have.");
        }
    }

    private CrmUser findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("Team member not found."));
    }

    private Department findDepartment(Long id) {
        if (id == null) {
            return null;
        }
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ApiException.badRequest("Department does not exist."));
        if (!department.isActive()) {
            throw ApiException.badRequest("Inactive departments cannot be assigned.");
        }
        return department;
    }

    private TeamMemberResponse toResponse(CrmUser user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .map(RoleService::displayName)
                .toList();
        return new TeamMemberResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles.isEmpty() ? null : roles.get(0),
                roles,
                user.getDepartment() == null ? "Unassigned" : user.getDepartment().getName(),
                user.getDepartment() == null ? null : user.getDepartment().getId(),
                RoleService.displayName(user.getStatus().name()),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private UserStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return UserStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("Status must be ACTIVE, INACTIVE, or INVITED.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String cleanSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }

    private String cleanRole(String role) {
        return role == null || role.isBlank() ? null : role.trim().toLowerCase(Locale.ROOT);
    }
}
