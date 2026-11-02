package com.productionhouse.crm.production.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "production_crew_members")
@Data
public class CrewMember {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	@Column(nullable = false)
	private String name;
	private String category;
	private String department;
	private String role;
	private String project;
	private String email;
	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Phone contact must be a valid 10-digit number")
	private String phone;

	@PrePersist
	@PreUpdate
	private void normalizePhone() {
		if (phone == null)
			return;
		String digits = phone.replaceAll("[^0-9]", "");
		if (digits.length() == 12 && digits.startsWith("91")) {
			digits = digits.substring(2);
		}
		phone = digits;
	}

	private Double rate;
	private String rateType;
	private String status;
	private String guild;
	private String contractStatus;
	private String agent;
	private Integer daysBooked;
	@Column(columnDefinition = "TEXT")
	private String dietaryNotes;
	private String tone;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "media_item_id")
	private MediaItem mediaItem;

	@JsonProperty("mediaItemId")
	public String getMediaItemId() {
		return mediaItem == null ? null : mediaItem.getId();
	}
}
