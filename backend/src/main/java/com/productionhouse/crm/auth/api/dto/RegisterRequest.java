package com.productionhouse.crm.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String username,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 6, max = 72) String password
) {
}
