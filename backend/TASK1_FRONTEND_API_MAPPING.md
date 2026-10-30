# Task 1 frontend-to-backend API mapping

This mapping was prepared by inspecting the current `frontend/src/pages/` screens, routes in `frontend/src/App.jsx`, and shared navigation in `frontend/src/layouts/MainLayout.jsx`. No API client, API service, or TypeScript interface currently exists. The screens use in-component sample arrays/local state; this document is the integration contract for replacing those sources without changing the existing frontend files in this backend task.

Base URL: `http://localhost:8080` in local development. JSON is used for request and response bodies. Authenticated requests send `Authorization: Bearer <accessToken>`.

## Authentication and current user

| Frontend component/action | Method and endpoint | Request fields | Response fields | Access |
|---|---|---|---|---|
| `Login.jsx` sign-in | `POST /api/auth/login` | `{ "email": "admin@studio.test", "password": "<password>" }` | `{ "accessToken": "...", "tokenType": "Bearer", "expiresIn": 900, "user": { "id", "name", "email", "roles", "permissions" } }` | Public; invalid credentials return 401 |
| `MainLayout.jsx` sign out | `POST /api/auth/logout` | None | 204, no body | Active authenticated user; revokes all that user's outstanding tokens |
| Future profile view | `GET /api/auth/me` | None | `{ "id", "name", "email", "roles": [], "permissions": [] }` | Active authenticated user |
| Future password form | `POST /api/auth/password` | `{ "currentPassword", "newPassword" }` | 204, no body | Active authenticated user; new password 12–72 characters and no more than 72 UTF-8 bytes |
| Invitation acceptance | `POST /api/auth/invitations/accept` | `{ "email", "token", "password" }` | 204, no body | Public; token is one-time and expires after 48 hours |

The existing login is demo-only: it accepts any non-empty credentials and stores a localStorage flag. Replace that behavior in the frontend integration by calling login and storing the returned access token securely for the session. The current `App.jsx` checks `frameflow-auth` while `MainLayout.jsx` clears `loopstream-auth`; remove the demo flag flow during frontend integration and call the logout endpoint. No refresh token is issued; access tokens expire after 15 minutes. A password change or logout invalidates outstanding tokens.

### Initial administrator provisioning

There is deliberately no public registration/bootstrap endpoint. On the first server startup against an empty user table, set both `CRM_BOOTSTRAP_ADMIN_EMAIL` and `CRM_BOOTSTRAP_ADMIN_PASSWORD` in the server environment to provision the initial administrator. The password must be 12–72 UTF-8 bytes. The bootstrap values are read only for initial provisioning; they do not reset existing users. Set `CRM_AUTH_JWT_SECRET` to a secret of at least 32 UTF-8 bytes. Do not put these secrets in source control or expose them in API responses. Sensitive setting writes additionally require `CRM_SETTINGS_ENCRYPTION_KEY` (at least 32 UTF-8 bytes).

## Dashboard (`Dashboard.jsx`, route `/`)

| UI data/action | Method and endpoint | Request fields | Response fields | Access |
|---|---|---|---|---|
| Task 1 statistics for the Team Members card and department/role chart integrations | `GET /api/dashboard` | None | `{ "totalTeamMembers": 0, "activeTeamMembers": 0, "inactiveTeamMembers": 0, "invitedTeamMembers": 0, "totalDepartments": 0, "membersByDepartment": [{ "id", "department", "members" }], "roleDistribution": [{ "role", "members" }] }` | `DASHBOARD_READ` |

All values are database-backed aggregates. `inactiveTeamMembers` counts only deactivated accounts; `invitedTeamMembers` counts accounts awaiting invitation acceptance. Departments with no members and configured roles with no assigned users are returned with a zero count. Empty tables return zero totals and empty chart arrays. The existing active-production, budget, invoice, production-progress, deadline, project, and activity widgets belong to other modules; this endpoint intentionally does not populate them with fabricated Task 1 data.

## Team & User Roles (`TeamUsers.jsx`, route `/team`)

The current table uses `name`, `email`, `role`, `dept`, and `status`; the add-member form submits `name`, `email`, and `role`. The default role is `Editor`; new accounts appear as `Invited`.

| UI action | Method and endpoint | Request fields | Response fields | Access |
|---|---|---|---|---|
| Search/list members | `GET /api/users?q=&status=&departmentId=&role=&page=0&size=20` | Query parameters: `q`, `status` (`ACTIVE`, `INACTIVE`, `INVITED`), `departmentId`, `role`, zero-based `page`, `size` (1–100) | `{ "content": [TeamMember], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }` | `USER_READ` |
| View member details | `GET /api/users/{id}` | Path `id` | `TeamMember` | `USER_READ` |
| Add/invite member | `POST /api/users` | `{ "name", "email", "role"?, "departmentId"? }` | `TeamMember` fields plus one-time `invitationToken` | `USER_WRITE`; requested role's permissions must be a subset of the caller's |
| Edit member details | `PUT /api/users/{id}` | `{ "name", "email", "departmentId": null }`; null clears department | `TeamMember` | `USER_WRITE` |
| Activate/deactivate | `PATCH /api/users/{id}/status` | `{ "status": "ACTIVE" \| "INACTIVE" }` | `TeamMember` | `USER_WRITE`; an invite must first be accepted |
| List assigned roles | `GET /api/users/{id}/roles` | Path `id` | `["Editor"]` | `USER_READ` |
| Add a role | `POST /api/users/{id}/roles` | `{ "role": "Editor" }` | Updated role-name array | `USER_WRITE`; prevents granting permissions the caller lacks |
| Replace assigned roles | `PUT /api/users/{id}/roles` | `{ "roles": ["Editor", "Viewer"] }` | Updated role-name array | `USER_WRITE`; prevents privilege escalation and removal of the last active administrator |
| Remove a role | `DELETE /api/users/{id}/roles/{role}` | Path `id`, role name | 204, no body | `USER_WRITE`; prevents removal of the last active administrator |
| Populate role selector / future role administration | `GET /api/roles` | None | `[{ "id", "name", "description", "permissions": [] }]` | `ROLE_READ` |
| Role detail/create/update | `GET /api/roles/{id}`, `POST /api/roles`, `PUT /api/roles/{id}` | Create/update: `{ "name", "description", "permissions": ["DASHBOARD_READ"] }` | Role object | `ROLE_READ` for GET; `ROLE_WRITE` for writes; permissions cannot exceed the caller's |

`TeamMember` response:

```json
{
  "id": 17,
  "name": "Priya Menon",
  "email": "priya@studio.test",
  "role": "Editor",
  "roles": ["Editor"],
  "dept": "Post-production",
  "departmentId": 4,
  "status": "Invited",
  "createdAt": "2026-10-30T06:00:00Z",
  "updatedAt": "2026-10-30T06:00:00Z"
}
```

`role` and `dept` are included with the existing frontend field names. The invitation token is returned only by the create response, stored hashed in the database, and never included in later user responses. No mail delivery integration exists; the caller must deliver the token through an approved invitation channel and must not display/log it. Invitation acceptance sets the password and activates the account. Password hashes and access tokens are never returned by user endpoints.

## Departments (`Departments.jsx`, route `/departments`)

| UI action | Method and endpoint | Request fields | Response fields | Access |
|---|---|---|---|---|
| List/search department cards | `GET /api/departments?q=` | Optional `q` searches department name and lead | Array of `Department` | `DEPARTMENT_READ` |
| View details | `GET /api/departments/{id}` | Path `id` | `Department` | `DEPARTMENT_READ` |
| Create department | `POST /api/departments` | `{ "name", "lead"? }` | `Department`, HTTP 201 | `DEPARTMENT_WRITE` |
| Update department | `PUT /api/departments/{id}` | `{ "name", "lead"? }` | `Department` | `DEPARTMENT_WRITE` |
| Delete department | `DELETE /api/departments/{id}` | Path `id` | 204, no body; 409 if any users are assigned | `DEPARTMENT_WRITE` |

`Department` contains `id`, `name`, `lead`, `members`, `code`, and `active`, matching the card fields. `members` is a database count; `code` is a three-character display abbreviation derived from the name. The current screen does not expose edit/delete/member assignment controls. User create/update requests accept `departmentId` for associating a member.

## Settings (`Settings.jsx`, route `/settings`)

Settings are stored as individual key/value records. The current screen has no persistence API and its Save button only changes local UI state. The frontend integration should load `GET /api/settings`, display non-sensitive values, and `PUT /api/settings/{key}` for each edited value.

| UI action | Method and endpoint | Request fields | Response fields | Access |
|---|---|---|---|---|
| Load all preferences | `GET /api/settings` | None | Array of `{ "key", "value", "sensitive", "updatedAt" }` | `SETTINGS_READ` |
| Load one preference | `GET /api/settings/{key}` | Path `key` | Setting object | `SETTINGS_READ` |
| Create preference | `POST /api/settings` | `{ "key", "value", "sensitive": false }` | Setting object, HTTP 201 | `SETTINGS_WRITE`; `sensitive` is required; sensitive values require `SETTINGS_SENSITIVE_WRITE` |
| Save preference | `PUT /api/settings/{key}` | `{ "value" }` | Setting object | `SETTINGS_WRITE`; sensitive settings also require `SETTINGS_SENSITIVE_WRITE` |
| Delete preference | `DELETE /api/settings/{key}` | Path `key` | 204, no body | `SETTINGS_WRITE`; sensitive settings also require `SETTINGS_SENSITIVE_WRITE` |

Suggested key mapping for current controls:

| Settings UI field | Key | Value |
|---|---|---|
| Workspace name / URL / timezone / currency | `workspace.name`, `workspace.url`, `workspace.timezone`, `workspace.currency` | String |
| General toggles | `allowProjectCreation`, `requireExpenseApproval`, `weeklyProductionSummary` | `"true"` or `"false"` |
| Notification toggles | `emailNotifications`, `deadlineReminders`, `invoicePaymentUpdates` | `"true"` or `"false"` |
| Security toggles | `twoFactorAuthentication`, `sessionTimeout` | `"true"` or `"false"` |
| Appearance and current generic Profile-tab toggles | `compactInterface`, `showDashboardTips`, `blueAccentColor` | `"true"` or `"false"` |

Setting sensitivity is explicit in the create request and persisted with the setting. The supported public preference keys are the workspace information and UI preference keys listed above; unrecognized keys must be marked sensitive. Sensitive values require `SETTINGS_SENSITIVE_WRITE`, are AES-GCM encrypted at rest using `CRM_SETTINGS_ENCRYPTION_KEY`, and all API responses return `value: null` for them. Updates preserve the stored sensitivity classification. The current settings UI is local-only; profile currently has no profile fields and renders the same generic toggles as Appearance.

These settings are persisted preferences. Toggles such as two-factor authentication, session timeout, and expense approval are not independently enforced by this Task 1 backend; enforcement must be wired by the corresponding auth/production/finance modules.

## Authentication, authorization, validation, and errors

All routes except login and invitation acceptance require a valid Bearer token and an active user. Tokens expire after 15 minutes. Current role permissions are loaded on each request, so role changes, user deactivation, password changes, and logout take effect immediately. There are no refresh tokens or public account-registration endpoints.

| Permission | Granted by default to | Route families |
|---|---|---|
| `DASHBOARD_READ` | ADMIN, MANAGER, EDITOR, VIEWER | `GET /api/dashboard` |
| `USER_READ`, `ROLE_READ`, `SETTINGS_READ` | ADMIN, MANAGER | User/role/settings read endpoints |
| `USER_WRITE`, `ROLE_WRITE`, `DEPARTMENT_WRITE`, `SETTINGS_WRITE`, `SETTINGS_SENSITIVE_WRITE` | ADMIN | Corresponding write endpoints; sensitive settings require both settings permissions |
| `DEPARTMENT_READ` | ADMIN, MANAGER, EDITOR, VIEWER | Department read endpoints |

These are the initial built-in role definitions. Administrators may create roles from permissions they themselves hold. A role cannot be assigned if it grants permissions the actor does not hold. The `ADMIN` role must retain every permission, and the last active administrator cannot be removed.

Errors use one response shape:

```json
{
  "timestamp": "2026-10-30T06:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Request validation failed.",
  "path": "/api/departments",
  "fieldErrors": { "name": "must not be blank" }
}
```

Common statuses: 200 success, 201 created, 204 successful no-content operation, 400 invalid input, 401 missing/invalid/expired authentication, 403 insufficient permission, 404 missing resource, and 409 duplicate/conflicting data or unsafe department deletion. User email is normalized to lowercase and must be unique. Department and role names are unique case-insensitively. Team list page is zero-based, defaults to page 0 and size 20, and supports up to 100 records per page.

## Backend implementation notes

- Feature code is isolated under `com.productionhouse.crm.dashboard`, `com.productionhouse.crm.systemadministration`, and reusable identity/security code under `com.productionhouse.crm.auth`.
- The existing Spring Boot `4.2.0-SNAPSHOT` and Java 17 declarations were retained. Added dependencies: MVC, Jackson 3, JPA, Spring Security, OAuth2 resource-server/JWT support, Bean Validation, MySQL Connector/J, H2 test database, and the Boot 4 MVC test starter. JWT signing/verification uses Spring Security's Nimbus JWT support; passwords use BCrypt.
- New additive JPA tables use the `crm_` prefix: `crm_users`, `crm_roles`, `crm_role_permissions`, `crm_user_roles`, `crm_departments`, and `crm_system_settings`. The sensitive-setting value column is sized for AES-GCM ciphertext of values up to the API's 2000-character limit; widening it preserves existing values. No existing database/table/data is dropped or recreated. No migration tool existed; the existing Hibernate `update` setting is retained. Test database schema is isolated to in-memory H2.
- The existing uncommitted `application.properties` edit is intentionally preserved. JWT secret, initial-admin credentials, settings-encryption key, and allowed frontend origins can be supplied through environment-backed Spring properties; no credentials are committed.
- No production/finance/scheduling endpoint or response metrics are fabricated. No frontend files were modified.
