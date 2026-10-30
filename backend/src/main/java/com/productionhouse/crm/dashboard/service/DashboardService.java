package com.productionhouse.crm.dashboard.service;

import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.RoleCountProjection;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.dashboard.api.dto.DashboardResponse;
import com.productionhouse.crm.dashboard.api.dto.DepartmentSummary;
import com.productionhouse.crm.dashboard.api.dto.RoleDistribution;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentCountProjection;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentRepository;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import com.productionhouse.crm.systemadministration.roles.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;

    public DashboardService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository
    ) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalMembers = userRepository.count();
        long activeMembers = userRepository.countByStatus(UserStatus.ACTIVE);
        long inactiveMembers = userRepository.countByStatus(UserStatus.INACTIVE);
        long invitedMembers = userRepository.countByStatus(UserStatus.INVITED);

        Map<String, Long> roleCounts = userRepository.countUsersByRole().stream()
                .collect(Collectors.toMap(
                        projection -> projection.getName().toUpperCase(java.util.Locale.ROOT),
                        RoleCountProjection::getCount
                ));
        var departmentSummaries = departmentRepository.countMembersByDepartment().stream()
                .map(this::toDepartmentSummary)
                .toList();
        var roleDistribution = roleRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Role::getName))
                .map(role -> new RoleDistribution(
                        com.productionhouse.crm.systemadministration.roles.service.RoleService.displayName(role.getName()),
                        roleCounts.getOrDefault(role.getName(), 0L)
                ))
                .toList();

        return new DashboardResponse(
                totalMembers,
                activeMembers,
                inactiveMembers,
                invitedMembers,
                departmentRepository.count(),
                departmentSummaries,
                roleDistribution
        );
    }

    private DepartmentSummary toDepartmentSummary(DepartmentCountProjection projection) {
        return new DepartmentSummary(projection.getId(), projection.getName(), projection.getCount());
    }
}
