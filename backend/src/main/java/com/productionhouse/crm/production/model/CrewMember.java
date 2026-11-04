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
    @Pattern(regexp = "^(91|1|44|971|61|65)[0-9]{10}$", message = "Select a supported country code and enter a 10-digit mobile number")
    private String phone;

    private Double rate;
    private String rateType;
    private String status;
    private String guild;
    private String contractStatus;
    private String agent;
    private Integer daysBooked;
    @Column(columnDefinition = "TEXT")
    private String dietaryNotes;

    @Lob
    @Column(name = "member_image", columnDefinition = "LONGTEXT")
    private String memberImage;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_item_id")
    private MediaItem mediaItem;

    @JsonProperty("mediaItemId")
    public String getMediaItemId() {
        return mediaItem == null ? null : mediaItem.getId();
    }
}
