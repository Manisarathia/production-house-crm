package com.productionhouse.crm.production.repository;

import com.productionhouse.crm.production.model.Episode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EpisodeRepository extends JpaRepository<Episode, String> {
}
