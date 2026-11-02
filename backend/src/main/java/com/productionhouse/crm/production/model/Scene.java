package com.productionhouse.crm.production.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "production_scenes")
@Data
public class Scene {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	private String project;
	private String episodeId;
	private String episodeName;
	private String sceneNumber;
	private String heading;
	private String setting;
	private String timeOfDay;
	private String pages;
	private String location;
	@Column(columnDefinition = "TEXT")
	private String characters;
	private String status;
	private LocalDate shootDate;
	@Column(columnDefinition = "TEXT")
	private String equipment;
	@Column(columnDefinition = "TEXT")
	private String description;
}
