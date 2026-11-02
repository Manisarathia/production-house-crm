package com.productionhouse.crm.systemadministration.settings.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SettingRequest(
        @NotBlank @Size(max = 100) String key,
        @jakarta.validation.constraints.NotNull @Size(max = 2000) String value,
        @jakarta.validation.constraints.NotNull Boolean sensitive
) {
}
