package com.productionhouse.crm.auth.service;

import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Set;

@Component
public class RoleAndAdminInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public RoleAndAdminInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${crm.bootstrap.admin-email:}") String adminEmail,
            @Value("${crm.bootstrap.admin-password:}") String adminPassword
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRole("ADMIN", "Full administrative access.", Set.copyOf(Arrays.asList(Permission.values())));
        seedRole("MANAGER", "Read access to team, departments, roles, settings, and dashboard.",
                Set.of(Permission.DASHBOARD_READ, Permission.USER_READ, Permission.ROLE_READ,
                        Permission.DEPARTMENT_READ, Permission.SETTINGS_READ));
        seedRole("EDITOR", "Dashboard and department read access.",
                Set.of(Permission.DASHBOARD_READ, Permission.DEPARTMENT_READ));
        seedRole("VIEWER", "Read-only dashboard and department access.",
                Set.of(Permission.DASHBOARD_READ, Permission.DEPARTMENT_READ));

        if (adminEmail.isBlank() && adminPassword.isBlank()) {
            return;
        }
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("Set both CRM_BOOTSTRAP_ADMIN_EMAIL and CRM_BOOTSTRAP_ADMIN_PASSWORD.");
        }
        if (!adminEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 12
                || adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Bootstrap admin email or password does not meet the required format.");
        }
        if (userRepository.count() != 0) {
            return;
        }
        Role adminRole = roleRepository.findByNameIgnoreCase("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Default ADMIN role was not initialized."));
        CrmUser administrator = new CrmUser(
                "Administrator",
                adminEmail.trim().toLowerCase(java.util.Locale.ROOT),
                passwordEncoder.encode(adminPassword),
                UserStatus.ACTIVE
        );
        administrator.setRoles(Set.of(adminRole));
        userRepository.save(administrator);
    }

    private void seedRole(String name, String description, Set<Permission> permissions) {
        Role existing = roleRepository.findByNameIgnoreCase(name).orElse(null);
        if (existing == null) {
            roleRepository.save(new Role(name, description, permissions));
            return;
        }

        // Permission enums can grow as modules are added. Reconcile the seeded
        // administrator role on startup so an existing installation receives
        // new system permissions without replacing any custom permissions.
        if ("ADMIN".equalsIgnoreCase(name) && existing.getPermissions().addAll(permissions)) {
            roleRepository.save(existing);
        }
    }
}
