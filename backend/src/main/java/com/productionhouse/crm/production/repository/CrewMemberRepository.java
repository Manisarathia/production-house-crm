package com.productionhouse.crm.production.repository;

import com.productionhouse.crm.production.model.CrewMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrewMemberRepository extends JpaRepository<CrewMember, String> {
}
