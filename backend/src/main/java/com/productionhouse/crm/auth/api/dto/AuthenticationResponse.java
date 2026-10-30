package com.productionhouse.crm.auth.api.dto;

public record AuthenticationResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        CurrentUserResponse user
) {
}
