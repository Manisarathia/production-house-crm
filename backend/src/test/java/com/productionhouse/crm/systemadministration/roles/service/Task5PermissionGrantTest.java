package com.productionhouse.crm.systemadministration.roles.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.systemadministration.roles.api.dto.RoleRequest;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class Task5PermissionGrantTest {
    @Test
    void roleManagementCanGrantTask5AuthoritiesToAnActorWhoHoldsThem() {
        var repository = mock(RoleRepository.class);
        when(repository.existsByNameIgnoreCase("MEDIA_EDITOR")).thenReturn(false);
        when(repository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var service = new RoleService(repository);
        Set<Permission> task5 = Set.of(Permission.MEDIA_READ, Permission.MEDIA_WRITE, Permission.MEDIA_DELETE,
                Permission.POSTPRODUCTION_READ, Permission.POSTPRODUCTION_WRITE, Permission.POSTPRODUCTION_DELETE,
                Permission.SINGER_READ, Permission.SINGER_WRITE, Permission.SINGER_DELETE,
                Permission.DUBBING_READ, Permission.DUBBING_WRITE, Permission.DUBBING_DELETE,
                Permission.CONTRACT_READ, Permission.CONTRACT_WRITE, Permission.CONTRACT_DELETE,
                Permission.RIGHTS_READ, Permission.RIGHTS_WRITE, Permission.RIGHTS_DELETE);

        var result = service.create(new RoleRequest("Media Editor", null, task5),
                new CurrentUser(7L, "admin@example.test", "Admin", task5));

        assertTrue(result.permissions().containsAll(task5));
    }

    @Test
    void roleManagementDoesNotAllowGrantingTask5AuthoritiesTheActorDoesNotHave() {
        var repository = mock(RoleRepository.class);
        when(repository.existsByNameIgnoreCase("MEDIA_EDITOR")).thenReturn(false);
        var service = new RoleService(repository);
        assertThrows(ApiException.class, () -> service.create(
                new RoleRequest("Media Editor", null, Set.of(Permission.MEDIA_DELETE)),
                new CurrentUser(7L, "editor@example.test", "Editor", Set.of(Permission.MEDIA_READ))));
        verify(repository, never()).save(any(Role.class));
    }
}
