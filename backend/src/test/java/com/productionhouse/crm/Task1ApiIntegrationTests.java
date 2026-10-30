package com.productionhouse.crm;

import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.systemadministration.department.entity.Department;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentRepository;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import com.productionhouse.crm.systemadministration.settings.entity.SystemSetting;
import com.productionhouse.crm.systemadministration.settings.repository.SettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=${spring.datasource.jdbc-url}",
        "spring.datasource.jdbc-url=jdbc:h2:mem:task1-api;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=update",
        "crm.auth.jwt-secret=task1-test-signing-secret-with-at-least-32-bytes",
        "crm.settings.encryption-key=task1-test-encryption-secret-with-at-least-32-bytes"
})
class Task1ApiIntegrationTests {
    private static final String ADMIN_EMAIL = "admin@task1.test";
    private static final String ADMIN_PASSWORD = "Task1-admin-password-123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SettingRepository settingRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        departmentRepository.deleteAll();
        settingRepository.deleteAll();
        CrmUser admin = new CrmUser(
                "Test Administrator",
                ADMIN_EMAIL,
                passwordEncoder.encode(ADMIN_PASSWORD),
                UserStatus.ACTIVE
        );
        admin.setRoles(Set.of(roleRepository.findByNameIgnoreCase("ADMIN").orElseThrow()));
        userRepository.saveAndFlush(admin);
    }

    @Test
    void rejectsUnauthenticatedRequestsAndAllowsAuthenticatedDashboardRead() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").exists());

        String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        mockMvc.perform(get("/api/dashboard").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTeamMembers").value(1))
                .andExpect(jsonPath("$.activeTeamMembers").value(1))
                .andExpect(jsonPath("$.inactiveTeamMembers").value(0))
                .andExpect(jsonPath("$.invitedTeamMembers").value(0))
                .andExpect(jsonPath("$.totalDepartments").value(0))
                .andExpect(jsonPath("$.membersByDepartment").isArray())
                .andExpect(jsonPath("$.roleDistribution[0].members").value(1));
    }

    @Test
    void departmentAndInvitationWorkflowsPersistAndFeedDashboardAggregates() throws Exception {
        String adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        MvcResult departmentResult = mockMvc.perform(post("/api/departments")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Post-production","lead":"Priya Menon"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Post-production"))
                .andExpect(jsonPath("$.lead").value("Priya Menon"))
                .andExpect(jsonPath("$.members").value(0))
                .andReturn();
        long departmentId = objectMapper.readTree(departmentResult.getResponse().getContentAsString())
                .get("id").asLong();

        MvcResult created = mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "name", "Priya Menon",
                                "email", "priya@studio.test",
                                "role", "Editor",
                                "departmentId", departmentId
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("Invited"))
                .andExpect(jsonPath("$.role").value("Editor"))
                .andExpect(jsonPath("$.dept").value("Post-production"))
                .andExpect(jsonPath("$.invitationToken").isNotEmpty())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();
        JsonNode invitation = objectMapper.readTree(created.getResponse().getContentAsString());
        String inviteToken = invitation.get("invitationToken").asString();
        long userId = invitation.get("id").asLong();

        mockMvc.perform(get("/api/dashboard").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTeamMembers").value(2))
                .andExpect(jsonPath("$.activeTeamMembers").value(1))
                .andExpect(jsonPath("$.inactiveTeamMembers").value(0))
                .andExpect(jsonPath("$.invitedTeamMembers").value(1));

        mockMvc.perform(get("/api/users/{id}", userId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("priya@studio.test"));
        mockMvc.perform(put("/api/users/{id}", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "name", "Priya Menon",
                                "email", "priya@studio.test",
                                "departmentId", departmentId
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.departmentId").value(departmentId));
        mockMvc.perform(post("/api/users/{id}/roles", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"role":"Viewer"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Editor"))
                .andExpect(jsonPath("$[1]").value("Viewer"));
        mockMvc.perform(delete("/api/users/{id}/roles/{role}", userId, "Viewer")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/users/{id}/roles", userId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Editor"));
        mockMvc.perform(put("/api/users/{id}/roles", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roles":["Editor","Viewer"]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        mockMvc.perform(put("/api/users/{id}/roles", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roles":["Editor"]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(patch("/api/users/{id}/status", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"ACTIVE"}
                                """))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/auth/invitations/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", "priya@studio.test",
                                "token", inviteToken,
                                "password", "Priya-secure-password-123"
                        ))))
                .andExpect(status().isNoContent());
        assertThat(userRepository.findById(userId).orElseThrow().getStatus()).isEqualTo(UserStatus.ACTIVE);

        String memberToken = login("priya@studio.test", "Priya-secure-password-123");
        mockMvc.perform(get("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .param("q", "Post-production")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(userId))
                .andExpect(jsonPath("$.content[0].status").value("Active"))
                .andExpect(jsonPath("$.totalElements").value(1));
        mockMvc.perform(get("/api/dashboard").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTeamMembers").value(2))
                .andExpect(jsonPath("$.activeTeamMembers").value(2))
                .andExpect(jsonPath("$.inactiveTeamMembers").value(0))
                .andExpect(jsonPath("$.invitedTeamMembers").value(0))
                .andExpect(jsonPath("$.totalDepartments").value(1))
                .andExpect(jsonPath("$.membersByDepartment[0].members").value(1))
                .andExpect(jsonPath("$.roleDistribution[0].members").value(1));

        mockMvc.perform(patch("/api/users/{id}/status", userId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"INACTIVE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Inactive"));
        mockMvc.perform(get("/api/dashboard").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inactiveTeamMembers").value(1))
                .andExpect(jsonPath("$.invitedTeamMembers").value(0));
        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(memberToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blocksInsufficientPermissionsAndPreventsPrivilegeEscalation() throws Exception {
        Role limited = roleRepository.saveAndFlush(new Role(
                "TEAM_WRITER",
                "Test permission boundary",
                Set.of(Permission.USER_WRITE, Permission.DASHBOARD_READ)
        ));
        CrmUser actor = new CrmUser(
                "Limited Manager",
                "manager@studio.test",
                passwordEncoder.encode("Manager-secure-password-123"),
                UserStatus.ACTIVE
        );
        actor.setRoles(Set.of(limited));
        userRepository.saveAndFlush(actor);

        String managerToken = login("manager@studio.test", "Manager-secure-password-123");
        long adminId = userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).orElseThrow().getId();
        mockMvc.perform(get("/api/users").header("Authorization", bearer(managerToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
        mockMvc.perform(post("/api/users/{id}/roles", adminId)
                        .header("Authorization", bearer(managerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"role":"Admin"}
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(login(ADMIN_EMAIL, ADMIN_PASSWORD)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Invalid","email":"not-an-email"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void departmentCannotBeDeletedWhileMembersAreAssignedAndDuplicateNameIsRejected() throws Exception {
        String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        MvcResult result = mockMvc.perform(post("/api/departments")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Production"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        long departmentId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/departments")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"production"}
                                """))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "name", "Production User",
                                "email", "production-user@studio.test",
                                "departmentId", departmentId
                        ))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Duplicate","email":"production-user@studio.test"}
                                """))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/api/departments/{id}", departmentId)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isConflict());
    }

    @Test
    void sensitiveSettingsAreEncryptedAndNeverReturned() throws Exception {
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS "
                        + "WHERE TABLE_NAME = 'CRM_SYSTEM_SETTINGS' AND COLUMN_NAME = 'IS_SENSITIVE'",
                Long.class
        )).isEqualTo(1L);

        String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"workspace.currency","value":"INR","sensitive":false}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value("INR"))
                .andExpect(jsonPath("$.sensitive").value(false));

        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"smtp.password","value":"never-return-this","sensitive":true}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.sensitive").value(true));
        SystemSetting stored = settingRepository.findByKeyIgnoreCase("smtp.password").orElseThrow();
        assertThat(stored.getValue()).isNotEqualTo("never-return-this");

        String maximumLengthSecret = "é".repeat(2000);
        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "key", "integration.largeSecret",
                                "value", maximumLengthSecret,
                                "sensitive", true
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value(org.hamcrest.Matchers.nullValue()));
        assertThat(settingRepository.findByKeyIgnoreCase("integration.largeSecret").orElseThrow().getValue())
                .hasSizeGreaterThan(2000);

        mockMvc.perform(get("/api/settings").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].key").value("integration.largeSecret"))
                .andExpect(jsonPath("$[0].value").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$[1].key").value("smtp.password"))
                .andExpect(jsonPath("$[1].value").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$[2].key").value("workspace.currency"))
                .andExpect(jsonPath("$[2].value").value("INR"));

        mockMvc.perform(get("/api/settings/smtp.password").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.sensitive").value(true));
        mockMvc.perform(put("/api/settings/workspace.currency")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"value":"GBP"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void roleManagementAndSensitiveSettingPermissionsAreEnforced() throws Exception {
        String adminToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        long adminId = userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).orElseThrow().getId();
        mockMvc.perform(patch("/api/users/{id}/status", adminId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"INACTIVE"}
                                """))
                .andExpect(status().isConflict());
        mockMvc.perform(put("/api/users/{id}/roles", adminId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"roles":["Editor"]}
                                """))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/api/users/{id}/roles/{role}", adminId, "Admin")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isConflict());
        MvcResult createdRole = mockMvc.perform(post("/api/roles")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Production Auditor",
                                  "description":"Read-only production access",
                                  "permissions":["DASHBOARD_READ","DEPARTMENT_READ"]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Production Auditor"))
                .andExpect(jsonPath("$.permissions.length()").value(2))
                .andReturn();
        long roleId = objectMapper.readTree(createdRole.getResponse().getContentAsString()).get("id").asLong();
        mockMvc.perform(get("/api/roles").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Production Auditor')]").exists());
        mockMvc.perform(get("/api/roles/{id}", roleId).header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(roleId));
        mockMvc.perform(put("/api/roles/{id}", roleId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Production Auditor",
                                  "description":"Updated read-only access",
                                  "permissions":["DASHBOARD_READ"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated read-only access"));

        Role settingsWriterRole = roleRepository.saveAndFlush(new Role(
                "SETTINGS_WRITER",
                "Cannot manage secrets",
                Set.of(Permission.SETTINGS_WRITE, Permission.DASHBOARD_READ)
        ));
        CrmUser settingsWriter = new CrmUser(
                "Settings Writer",
                "settings-writer@studio.test",
                passwordEncoder.encode("Settings-writer-password-123"),
                UserStatus.ACTIVE
        );
        settingsWriter.setRoles(Set.of(settingsWriterRole));
        userRepository.saveAndFlush(settingsWriter);
        String writerToken = login("settings-writer@studio.test", "Settings-writer-password-123");

        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(writerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"workspace.name","value":"Studio","sensitive":false}
                                """))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(writerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"integration.apiKey","value":"private-value","sensitive":true}
                                """))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"integration.apiKey","value":"must-not-be-public","sensitive":false}
                                """))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"workspace.name","value":"Missing classification"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.sensitive").exists());
    }

    @Test
    void logoutRevokesIssuedTokensAndDepartmentValidationReturnsFieldErrors() throws Exception {
        String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        mockMvc.perform(post("/api/auth/logout").header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/dashboard").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());

        String freshToken = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        mockMvc.perform(post("/api/departments")
                        .header("Authorization", bearer(freshToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":" "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }

    @Test
    void supportsProfilePasswordChangesAndDepartmentAndSettingsCrud() throws Exception {
        String token = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(ADMIN_EMAIL));
        mockMvc.perform(post("/api/auth/password")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword":"Task1-admin-password-123",
                                  "newPassword":"Task1-admin-password-456"
                                }
                                """))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@task1.test","password":"Task1-admin-password-123"}
                                """))
                .andExpect(status().isUnauthorized());
        String freshToken = login(ADMIN_EMAIL, "Task1-admin-password-456");

        MvcResult department = mockMvc.perform(post("/api/departments")
                        .header("Authorization", bearer(freshToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Creative","lead":"Ananya Rao"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        long departmentId = objectMapper.readTree(department.getResponse().getContentAsString()).get("id").asLong();
        mockMvc.perform(get("/api/departments").header("Authorization", bearer(freshToken)).param("q", "Ananya"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Creative"));
        mockMvc.perform(get("/api/departments/{id}", departmentId)
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(departmentId));
        mockMvc.perform(put("/api/departments/{id}", departmentId)
                        .header("Authorization", bearer(freshToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Creative & Development","lead":"Karthik S"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Creative & Development"));
        mockMvc.perform(delete("/api/departments/{id}", departmentId)
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/departments/{id}", departmentId)
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/settings")
                        .header("Authorization", bearer(freshToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key":"workspace.name","value":"Studio North","sensitive":false}
                                """))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/settings").header("Authorization", bearer(freshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("workspace.name"));
        mockMvc.perform(get("/api/settings/workspace.name")
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value("Studio North"));
        mockMvc.perform(put("/api/settings/workspace.name")
                        .header("Authorization", bearer(freshToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"value":"FrameFlow"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value("FrameFlow"));
        mockMvc.perform(delete("/api/settings/workspace.name")
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/settings/workspace.name")
                        .header("Authorization", bearer(freshToken)))
                .andExpect(status().isNotFound());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", email,
                                "password", password
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asString();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
