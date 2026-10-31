package com.productionhouse.crm.task5;

import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.auth.service.RoleAndAdminInitializer;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=${spring.datasource.jdbc-url}",
        "spring.datasource.jdbc-url=jdbc:h2:mem:task5-auth-api;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=update",
        "crm.auth.jwt-secret=task5-auth-test-signing-secret-with-at-least-32-bytes",
        "crm.settings.encryption-key=task5-auth-test-encryption-secret-with-at-least-32-bytes"
})
class Task5AuthorizationIntegrationTest {
    private static final String ADMIN_EMAIL = "admin@studio.test";
    private static final String PASSWORD = "Task5-admin-password-123";
    private static final Set<Permission> TASK5_PERMISSIONS = Set.of(
            Permission.MEDIA_READ, Permission.MEDIA_WRITE, Permission.MEDIA_DELETE,
            Permission.POSTPRODUCTION_READ, Permission.POSTPRODUCTION_WRITE, Permission.POSTPRODUCTION_DELETE,
            Permission.SINGER_READ, Permission.SINGER_WRITE, Permission.SINGER_DELETE,
            Permission.DUBBING_READ, Permission.DUBBING_WRITE, Permission.DUBBING_DELETE,
            Permission.CONTRACT_READ, Permission.CONTRACT_WRITE, Permission.CONTRACT_DELETE,
            Permission.RIGHTS_READ, Permission.RIGHTS_WRITE, Permission.RIGHTS_DELETE
    );

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RoleAndAdminInitializer initializer;

    @BeforeEach
    void clearUsers() {
        userRepository.deleteAll();
    }

    @Test
    void reconcilesExistingAdminRoleAndAllowsAdminMediaCreation() throws Exception {
        Role adminRole = roleRepository.findByNameIgnoreCase("ADMIN").orElseThrow();
        adminRole.setPermissions(Set.of(Permission.DASHBOARD_READ, Permission.USER_READ,
                Permission.USER_WRITE, Permission.ROLE_READ, Permission.ROLE_WRITE));
        roleRepository.saveAndFlush(adminRole);

        initializer.run(new DefaultApplicationArguments());
        assertThat(roleRepository.findByNameIgnoreCase("ADMIN").orElseThrow().getPermissions())
                .containsAll(TASK5_PERMISSIONS);

        CrmUser admin = new CrmUser("Studio Administrator", ADMIN_EMAIL,
                passwordEncoder.encode(PASSWORD), UserStatus.ACTIVE);
        admin.setRoles(Set.of(adminRole));
        userRepository.saveAndFlush(admin);

        String token = login(ADMIN_EMAIL, PASSWORD);
        mockMvc.perform(post("/api/mediahouse/media")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Studio trailer","assetType":"VIDEO","status":"READY"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Studio trailer"));
    }

    @Test
    void authenticatedUserWithoutMediaWriteReceivesForbidden() throws Exception {
        Role readOnly = roleRepository.findByNameIgnoreCase("TASK5_READ_ONLY")
                .orElseGet(() -> roleRepository.save(new Role("TASK5_READ_ONLY", "Media read only.",
                        Set.of(Permission.MEDIA_READ))));
        CrmUser user = new CrmUser("Read Only User", "reader@studio.test",
                passwordEncoder.encode(PASSWORD), UserStatus.ACTIVE);
        user.setRoles(Set.of(readOnly));
        userRepository.saveAndFlush(user);

        String token = login("reader@studio.test", PASSWORD);
        mockMvc.perform(post("/api/mediahouse/media")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Blocked asset","assetType":"VIDEO","status":"READY"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You do not have permission to perform this action."));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asString();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
