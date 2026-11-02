package com.productionhouse.crm.dashboard.api.dto;

import java.math.BigDecimal;

public record DashboardTrendPoint(
        String month,
        long activeProductions,
        long teamMembers,
        BigDecimal totalBudget,
        Long pendingInvoices,
        Long overdueInvoices
) {
}
