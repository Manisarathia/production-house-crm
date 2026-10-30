package com.productionhouse.crm.systemadministration.settings.api.dto;

import java.time.Instant;

public record SettingResponse(String key, String value, boolean sensitive, Instant updatedAt) {
}
