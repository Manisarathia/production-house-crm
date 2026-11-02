package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class OttPublishing extends BaseEntity {
    @NotBlank(message = "Title is required") private String title;
    @NotBlank(message = "Platform is required") private String platform;
    private String contentType;
    private String region;
    @NotNull(message = "Release date is required") private LocalDate releaseDate;
    private LocalDate publishedOn;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "draft|in-review|scheduled|published|failed", message = "Invalid status")
    private String status;
    @Pattern(regexp = "^(https?://.+)?$", message = "Watch link must start with http:// or https://")
    private String contentUrl;
    @Column(length = 2000) private String notes;
}
