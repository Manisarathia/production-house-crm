package com.productionhouse.crm.production.repository;

import com.productionhouse.crm.production.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, String> {
}
