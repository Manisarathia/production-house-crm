package com.productionhouse.crm.auth.api.dto;

import java.util.List;

public record CurrentUserResponse(
        Long id,
        String name,
        String email,
        List<String> roles,
        List<String> permissions
) {
}
