package com.productionhouse.crm.production.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "media_items")
@Data
public class MediaItem {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "project_id", nullable = false)
	private Project project;

	@Column(nullable = false)
	private String title;

	@Column(name = "poster_url", columnDefinition = "LONGTEXT")
	private String posterUrl;

	@Column(name = "season_number")
	private Integer seasonNumber;

	@JsonIgnore
	@JsonIgnoreProperties("mediaItem")
	@OneToMany(mappedBy = "mediaItem", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Episode> episodes = new ArrayList<>();

}
