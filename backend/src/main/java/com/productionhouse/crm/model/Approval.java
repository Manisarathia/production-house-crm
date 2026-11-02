package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Approval extends BaseEntity {
    @NotBlank(message = "Item for approval is required") private String title;
    @NotBlank(message = "Type is required") private String type;
    @NotBlank(message = "Requested by is required") private String requestedBy;
    @NotBlank(message = "Stage is required")
    @Pattern(regexp = "director|producer|studio-head", message = "Invalid stage")
    private String stage;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "pending|approved|rejected", message = "Invalid status")
    private String status;
    private LocalDate requestedOn;
    private LocalDate decidedOn;
    @Column(length = 2000) private String remarks;
}
