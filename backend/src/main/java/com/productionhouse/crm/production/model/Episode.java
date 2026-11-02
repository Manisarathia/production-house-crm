package com.productionhouse.crm.production.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "production_episodes")
@Data
public class Episode {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "media_item_id")
	private MediaItem mediaItem;
	private String project;
	private Integer episodeNumber;
	private String title;
	private String runtime;
	private String status;
	private String director;
	private String writer;
	private LocalDate targetAirDate;
	@Column(columnDefinition = "TEXT")
	private String synopsis;
	private Integer scenesCount;
	private Integer scenesCompleted;
}
