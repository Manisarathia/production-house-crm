package com.productionhouse.crm.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank @jakarta.validation.constraints.Size(max = 72) String password
) {
}
