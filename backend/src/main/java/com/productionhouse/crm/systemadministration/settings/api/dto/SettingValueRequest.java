package com.productionhouse.crm.systemadministration.settings.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SettingValueRequest(
        @NotNull @Size(max = 2000) String value
) {
}
