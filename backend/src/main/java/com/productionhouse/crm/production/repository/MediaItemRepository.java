package com.productionhouse.crm.production.repository;

import com.productionhouse.crm.production.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaItemRepository extends JpaRepository<MediaItem, String> {
	List<MediaItem> findByProjectId(String projectId);
}
