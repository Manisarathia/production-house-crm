package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Delivery extends BaseEntity {
    @NotBlank(message = "Deliverable is required") private String title;
    @NotBlank(message = "Type is required") private String type;
    @Column(name = "file_format") private String format;
    @NotBlank(message = "Recipient is required") private String recipient;
    @NotNull(message = "Due date is required") private LocalDate dueDate;
    private LocalDate deliveredOn;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "pending|in-progress|delivered|delayed", message = "Invalid status")
    private String status;
    @Column(length = 2000) private String notes;
}
