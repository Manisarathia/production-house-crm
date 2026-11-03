package com.productionhouse.crm.dashboard.api;

import com.productionhouse.crm.dashboard.api.dto.DashboardResponse;
import com.productionhouse.crm.dashboard.api.dto.DashboardTrendPoint;
import com.productionhouse.crm.dashboard.service.DashboardService;
import com.productionhouse.crm.dashboard.service.DashboardTrendService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final DashboardTrendService dashboardTrendService;

    public DashboardController(DashboardService dashboardService, DashboardTrendService dashboardTrendService) {
        this.dashboardService = dashboardService;
        this.dashboardTrendService = dashboardTrendService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public List<DashboardTrendPoint> getDashboardTrends() {
        return dashboardTrendService.getLastSixMonths();
    }
}
