package com.productionhouse.crm.systemadministration.settings.repository;

import com.productionhouse.crm.systemadministration.settings.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findByKeyIgnoreCase(String key);

    boolean existsByKeyIgnoreCase(String key);
}
