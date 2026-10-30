package com.productionhouse.crm.systemadministration.department.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.systemadministration.department.api.dto.DepartmentRequest;
import com.productionhouse.crm.systemadministration.department.api.dto.DepartmentResponse;
import com.productionhouse.crm.systemadministration.department.entity.Department;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentCountProjection;
import com.productionhouse.crm.systemadministration.department.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> list(String query) {
        Map<Long, Long> counts = departmentRepository.countMembersByDepartment().stream()
                .collect(Collectors.toMap(DepartmentCountProjection::getId, DepartmentCountProjection::getCount));
        String normalized = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .filter(department -> normalized.isEmpty()
                        || department.getName().toLowerCase(Locale.ROOT).contains(normalized)
                        || department.getLeadName() != null
                        && department.getLeadName().toLowerCase(Locale.ROOT).contains(normalized))
                .map(department -> toResponse(department, counts.getOrDefault(department.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse get(Long id) {
        Department department = findDepartment(id);
        return toResponse(department, departmentRepository.countMembersByDepartmentId(id));
    }

    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        String name = request.name().trim();
        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw ApiException.conflict("A department with this name already exists.");
        }
        Department department = new Department(name, cleanLead(request.lead()));
        return toResponse(departmentRepository.save(department), 0);
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentRequest request) {
        Department department = findDepartment(id);
        String name = request.name().trim();
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw ApiException.conflict("A department with this name already exists.");
        }
        department.setName(name);
        department.setLeadName(cleanLead(request.lead()));
        return toResponse(department, departmentRepository.countMembersByDepartmentId(id));
    }

    @Transactional
    public void delete(Long id) {
        Department department = findDepartment(id);
        if (userRepository.existsByDepartment_Id(id)) {
            throw ApiException.conflict("Department cannot be deleted while team members are assigned.");
        }
        departmentRepository.delete(department);
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Department not found."));
    }

    private DepartmentResponse toResponse(Department department, long members) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getLeadName(),
                members,
                departmentCode(department.getName()),
                department.isActive()
        );
    }

    private String departmentCode(String name) {
        String letters = name.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
        return letters.substring(0, Math.min(3, letters.length()));
    }

    private String cleanLead(String lead) {
        return lead == null || lead.isBlank() ? null : lead.trim();
    }
}
