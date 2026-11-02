package com.productionhouse.crm.production.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "project_cast_crew")
@Data
public class ProjectCastCrew {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "media_item_id")
	private MediaItem mediaItem;
	private String name;
	private String role;
}
