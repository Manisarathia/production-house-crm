package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Schedule extends BaseEntity {
    @NotBlank(message = "Scene is required") private String scene;
    @NotNull(message = "Shoot date is required") private LocalDate shootDate;
    private String startTime;
    private String endTime;
    private String location;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "scheduled|in-progress|completed|delayed", message = "Invalid status")
    private String status;
    @Column(length = 2000) private String notes;
}
