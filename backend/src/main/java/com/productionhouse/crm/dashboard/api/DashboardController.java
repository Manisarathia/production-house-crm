package com.productionhouse.crm.dashboard.api;

import com.productionhouse.crm.dashboard.api.dto.DashboardResponse;
import com.productionhouse.crm.dashboard.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}
