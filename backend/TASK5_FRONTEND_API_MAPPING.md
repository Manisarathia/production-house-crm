**# Task 5 API mapping**



All routes use the existing bearer JWT authentication. Missing/invalid authentication returns \`401\`; missing authorities return \`403\`. Errors use the shared \`ApiError\` envelope. List operations return a Spring \`Page\` with \`content\`, \`number\`, \`size\`, \`totalElements\`, and \`totalPages\`. Page indexes are zero-based; page size defaults to 20 and is limited to 100.



**## Authentication and authorities**



\| Resource | Read (list and item) | Create/update | Delete |

\|---|---|---|---|

\| Media | \`MEDIA_READ\` | \`MEDIA_WRITE\` | \`MEDIA_DELETE\` |

\| Post-production | \`POSTPRODUCTION_READ\` | \`POSTPRODUCTION_WRITE\` | \`POSTPRODUCTION_DELETE\` |

\| Singers | \`SINGER_READ\` | \`SINGER_WRITE\` | \`SINGER_DELETE\` |

\| Dubbing | \`DUBBING_READ\` | \`DUBBING_WRITE\` | \`DUBBING_DELETE\` |

\| Contracts | \`CONTRACT_READ\` | \`CONTRACT_WRITE\` | \`CONTRACT_DELETE\` |

\| Rights | \`RIGHTS_READ\` | \`RIGHTS_WRITE\` | \`RIGHTS_DELETE\` |



These values are part of the existing \`Permission\` enum. Role creation accepts them through the existing role API, subject to the current rule that an actor can grant only permissions they hold. The seeded administrator receives all enum authorities.



**## Routes and fields**



Each resource supports \`GET {base}\`, \`GET {base}/{id}\`, \`POST {base}\` (201), \`PUT {base}/{id}\`, and \`DELETE {base}/{id}\` (204). Request and response fields below are specific to that resource. Responses include \`id\`, \`createdAt\`, and \`updatedAt\`.



**### Media assets — \`/api/mediahouse/media\`**



POST/PUT fields: \`name\` (required), \`description\`, \`projectRef\`, \`assetType\` (required), \`status\` (required), \`storageReference\`, \`format\`, \`sizeBytes\` (nonnegative), \`durationSeconds\` (nonnegative), \`notes\`, \`active\`.



List filters: \`q\` (name/description), \`type\`, \`status\`, \`projectRef\`; pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt,assetType\`; \`direction\` is \`asc\` or \`desc\`.



Example request:



\`\`\`json

{"name":"Launch trailer","description":"Approved cut","projectRef":"PROJECT-42","assetType":"VIDEO","status":"READY","storageReference":"vault://media/42","format":"MP4","sizeBytes":64000000,"durationSeconds":90,"notes":"Final export","active":true}

\`\`\`



Response fields: \`id\`, \`name\`, \`description\`, \`projectRef\`, \`assetType\`, \`status\`, \`storageReference\`, \`format\`, \`sizeBytes\`, \`durationSeconds\`, \`notes\`, \`active\`, \`createdAt\`, \`updatedAt\`.



**### Post-production — \`/api/mediahouse/postproduction\`**



POST/PUT fields: \`name\` (required), \`description\`, \`projectRef\`, \`mediaId\` (optional existing media asset), \`assigneeId\` (optional existing CRM user), \`status\` (required), \`priority\`, \`startedAt\`, \`dueAt\`, \`completedAt\`, \`notes\`, \`active\`. The response exposes \`assigneeId\` and the CRM user's display name.



Statuses: \`NOT_STARTED\`, \`IN_PROGRESS\`, \`IN_REVIEW\`, \`COMPLETED\`, \`ON_HOLD\`. Transitions: NOT_STARTED → IN_PROGRESS/ON_HOLD; IN_PROGRESS → IN_REVIEW/ON_HOLD; IN_REVIEW → IN_PROGRESS/COMPLETED/ON_HOLD; ON_HOLD → NOT_STARTED/IN_PROGRESS. COMPLETED is terminal. A completed task requires \`completedAt\`; other statuses reject it. \`dueAt\` cannot precede \`startedAt\`.



List filters: \`q\`, \`status\`, \`projectRef\`, \`assigneeId\`, \`dueBefore\`, \`dueAfter\`; pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt,dueAt,startedAt\`; \`direction\` is \`asc\` or \`desc\`.



Response fields: \`id\`, \`name\`, \`description\`, \`projectRef\`, \`mediaId\`, \`assigneeId\`, \`assigneeName\`, \`status\`, \`priority\`, \`startedAt\`, \`dueAt\`, \`completedAt\`, \`notes\`, \`active\`, \`createdAt\`, \`updatedAt\`.



**### Singers — \`/api/audio/singers\`**



POST/PUT fields: \`name\` (required), \`email\`, \`phone\`, \`languages\` (comma-separated), \`voiceType\`, \`voiceRange\`, \`biography\`, \`status\` (ACTIVE or INACTIVE), \`active\`. If both \`status\` and \`active\` are supplied they must agree. Email is validated when supplied.



List filters: \`q\` (name), \`language\` (exact match against a comma-separated language), \`status\`, \`active\`; pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt\`; \`direction\` is \`asc\` or \`desc\`.



Response fields: \`id\`, \`name\`, \`email\`, \`phone\`, \`languages\`, \`voiceType\`, \`voiceRange\`, \`biography\`, \`status\`, \`active\`, \`createdAt\`, \`updatedAt\`.



**### Dubbing — \`/api/audio/dubbing\`**



POST/PUT fields: \`name\` (required), \`projectRef\`, \`singerId\` (required existing singer), \`mediaId\` (optional existing media asset), \`scheduledAt\` and \`endsAt\` (required ISO local date-times; end must be later), \`studio\` (required studio name), \`language\` (required), \`status\` (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD), \`notes\`, \`active\`.



List filters: \`q\`, \`status\`, \`projectRef\`, \`singerId\`, \`language\`, \`from\`, \`to\` (ISO local date-times); pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt,scheduledAt,endsAt\`; \`direction\` is \`asc\` or \`desc\`.



The current project has no studio registry or stable studio identifier. Dubbing stores a studio name, so cross-booking conflict detection is not enabled. References to singers and media are validated.



Response fields: \`id\`, \`name\`, \`projectRef\`, \`singerId\`, \`singerName\`, \`mediaId\`, \`scheduledAt\`, \`endsAt\`, \`studio\`, \`language\`, \`status\`, \`notes\`, \`active\`, \`createdAt\`, \`updatedAt\`.



**### Contracts — \`/api/legal/contracts\`**



POST/PUT fields: \`name\` (required title), \`description\`, \`projectRef\`, \`contractType\` (required), \`partyOne\` (required), \`partyTwo\`, \`mediaId\` (optional existing media asset), \`status\` (DRAFT, PENDING, ACTIVE, EXPIRED, TERMINATED), \`startsAt\` (required), \`endsAt\`, \`renewalAt\`, \`documentReference\`, \`notes\`, \`active\`.



End and renewal dates cannot precede the start date. Allowed lifecycle changes are DRAFT → PENDING/TERMINATED, PENDING → ACTIVE/TERMINATED, and ACTIVE → EXPIRED/TERMINATED. An ACTIVE contract whose end date has passed is returned as EXPIRED. Responses use the contract-specific DTO and omit freeform \`description\` and \`notes\`; document references and party metadata are available only behind \`CONTRACT_READ\`.



List filters: \`q\` (title/parties), \`status\` (uses effective expiration state), \`projectRef\`, \`contractType\`, \`expiresBefore\`; pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt,endsAt\`; \`direction\` is \`asc\` or \`desc\`.



Response fields: \`id\`, \`name\`, \`projectRef\`, \`contractType\`, \`partyOne\`, \`partyTwo\`, \`mediaId\`, \`status\`, \`startsAt\`, \`endsAt\`, \`renewalAt\`, \`documentReference\`, \`active\`, \`createdAt\`, \`updatedAt\`. Freeform \`description\` and \`notes\` are omitted.



**### Content rights — \`/api/legal/rights\`**



POST/PUT fields: \`name\` (required), \`description\`, \`projectRef\`, \`rightsType\` (required), \`mediaId\` (required existing media asset), \`contractId\` (optional existing contract), \`territory\` (required), \`platforms\` (required comma-separated), \`languages\`, \`exclusive\`, \`startsAt\` and \`endsAt\` (required, end cannot precede start), \`restrictions\`, \`status\` (DRAFT, ACTIVE, EXPIRED, TERMINATED), \`active\`.



An ACTIVE record whose end date has passed is returned as EXPIRED. List filters: \`q\`, \`status\` (uses effective expiration state), \`projectRef\`, \`mediaId\`, \`territory\`, \`platform\` (exact token match), \`expiresBefore\`, and \`expiresWithinDays\` (0–3650 days from today); pagination: \`page\`, \`size\`. Sorting: \`sort\` in \`name,status,createdAt,updatedAt,startsAt,endsAt\`; \`direction\` is \`asc\` or \`desc\`.



Response fields: \`id\`, \`name\`, \`description\`, \`projectRef\`, \`rightsType\`, \`mediaId\`, \`contractId\`, \`territory\`, \`platforms\`, \`languages\`, \`exclusive\`, \`startsAt\`, \`endsAt\`, \`restrictions\`, \`status\`, \`active\`, \`createdAt\`, \`updatedAt\`.



**## Validation, errors, and compatibility**



Bean validation failures, invalid enum-like statuses, date rules, unknown referenced records, and invalid pagination return \`400\`. Missing resource IDs return \`404\`; relational delete conflicts return \`409\`.



The base routes and JWT authorization are unchanged. Request/response bodies are intentionally breaking changes from the previous generic Task5Record shape: clients must send the resource-specific fields above and consume the corresponding response fields. The old generic \`relatedRecordId\` query filter is replaced by explicit \`mediaId\`, \`singerId\`, or \`contractId\` filters where applicable.



No project entity exists, so \`projectRef\` remains a bounded external reference string and cannot be FK-validated. A studio registry is also absent. No binaries are stored; media and contract documents use storage/document references only.



**## Database and migration notes**



Existing table names remain \`crm_media_media\`, \`crm_media_postproduction\`, \`crm_media_singer\`, \`crm_media_dubbing\`, \`crm_media_contracts\`, and \`crm_media_rights\`. Common identity, name, description, project reference, status, notes, active, and audit columns remain mapped. Compatible legacy fields reuse their old columns where their meaning is safe (for example media type and contract type). New contact-email, user/media/singer relationship, and dubbing schedule columns are additive; old generic contact/assignee values are deliberately not reinterpreted as emails or user IDs. Relationship columns are nullable in the schema to preserve older rows, while new API requests validate required references. Hibernate schema update does not drop legacy generic columns; unused columns may remain until a separately reviewed migration. Existing generic records are not automatically converted because their old fields did not reliably encode the new domain meanings.


## Postman verification results (2026-10-31)

The following basic CRUD flows were exercised manually in Postman against the local backend at `http://localhost:8080`, using a valid Bearer JWT. These results verify the tested happy paths; they do not replace automated tests or exhaustive validation/authorization testing.

| Resource | List before create | Create | Read by ID | Update | Delete | List after delete |
|---|---:|---:|---:|---:|---:|---|
| Media (`/api/mediahouse/media`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty |
| Post-production (`/api/mediahouse/postproduction`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty |
| Singers (`/api/audio/singers`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty |
| Dubbing (`/api/audio/dubbing`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty |
| Contracts (`/api/legal/contracts`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty |
| Rights (`/api/legal/rights`) | 200, empty | 201 | 200 | 200 | 204 | 200, empty after cleanup |

`GET` list responses used the Spring `Page` shape. Empty lists returned `content: []`, `numberOfElements: 0`, and `totalElements: 0`. Successful deletes returned `204 No Content`; the final list check confirmed no remaining records in each tested resource list.

### Test notes and observed behavior

- Media creation initially returned `400 Bad Request` because `assetType` was missing (`fieldErrors.assetType: must not be blank`). Adding `assetType: "FILM"` produced `201 Created`; the created media record used ID `2`.
- Dubbing creation was tested with an existing singer reference. The test session was deleted and the subsequent list was empty. A GET by the deleted session ID correctly returned `404` (expected after deletion); list verification returned `200` with an empty `content` array.
- Contract create/read/update/delete passed. The tested contract response omitted the freeform `description` and `notes` fields, consistent with the contract DTO behavior documented above.
- Rights creation was tested with required `mediaId: 2`. One additional earlier test record (ID `1`) was discovered during final list verification after deleting the later test record (ID `2`); both rights records were then deleted. The final rights list returned `200` with `content: []` and `totalElements: 0`.
- The media record with ID `2` was created as a prerequisite for rights testing and was not deleted in the recorded test sequence. Remove it separately if a completely clean test database is required. Other prerequisite records (such as the singer used for dubbing) may also remain unless separately checked.
- The observed post-production `startedAt` response displayed a date-only value even though a local date-time had been submitted. Confirm the intended API date/time format before frontend integration if time-of-day precision is required.

### Verification scope

This Postman pass covered basic list, create, read-by-ID, update, delete, and post-delete list checks for all six resource routes. It did not independently exercise every list filter/sort option, every enum/status transition, all validation failures, all permission combinations, relational delete-conflict scenarios, or frontend integration. Those remain separate verification items.
