package com.productionhouse.crm.auth.repository;

import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import com.productionhouse.crm.auth.entity.UserStatus;

public interface UserRepository extends JpaRepository<CrmUser, Long> {
    Optional<CrmUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByDepartment_Id(Long departmentId);

    Optional<CrmUser> findByInvitationTokenHash(String invitationTokenHash);

    long countByStatus(UserStatus status);

    @Query("""
            select count(distinct u) from CrmUser u join u.roles r
            where upper(r.name) = upper(:roleName) and u.status = :status
            """)
    long countUsersWithRoleAndStatus(@Param("roleName") String roleName, @Param("status") UserStatus status);

    @Query("""
            select distinct u from CrmUser u
            left join u.department d
            left join u.roles r
            where (:search is null or lower(u.name) like lower(concat('%', :search, '%'))
                or lower(u.email) like lower(concat('%', :search, '%'))
                or lower(d.name) like lower(concat('%', :search, '%'))
                or lower(r.name) like lower(concat('%', :search, '%')))
              and (:status is null or u.status = :status)
              and (:departmentId is null or d.id = :departmentId)
              and (:roleName is null or lower(r.name) = lower(:roleName))
            """)
    Page<CrmUser> search(
            @Param("search") String search,
            @Param("status") UserStatus status,
            @Param("departmentId") Long departmentId,
            @Param("roleName") String roleName,
            Pageable pageable
    );

    @Query("""
            select r.name as name, count(u.id) as count
            from CrmUser u join u.roles r
            group by r.name order by r.name
            """)
    java.util.List<RoleCountProjection> countUsersByRole();
}
