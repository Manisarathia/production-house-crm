package com.productionhouse.crm.systemadministration.department.api.dto;

public record DepartmentResponse(
        Long id,
        String name,
        String lead,
        long members,
        String code,
        boolean active
) {
}
