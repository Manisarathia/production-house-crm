package com.productionhouse.crm.systemadministration.department.repository;

import com.productionhouse.crm.systemadministration.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("""
            select d.id as id, d.name as name, count(u.id) as count
            from Department d left join com.productionhouse.crm.auth.entity.CrmUser u on u.department = d
            group by d.id, d.name order by d.name
            """)
    List<DepartmentCountProjection> countMembersByDepartment();

    @Query("""
            select count(u.id)
            from com.productionhouse.crm.auth.entity.CrmUser u
            where u.department.id = :departmentId
            """)
    long countMembersByDepartmentId(@Param("departmentId") Long departmentId);
}
