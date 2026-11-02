package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Notification extends BaseEntity {
    @NotBlank(message = "Title is required") private String title;
    @NotBlank(message = "Category is required") private String type;
    @NotBlank(message = "Level is required")
    @Pattern(regexp = "info|success|warning|critical", message = "Invalid level")
    private String level;
    @NotBlank(message = "Message is required") @Column(length = 2000) private String message;
    // READ is a reserved word in MySQL, so the column is named is_read
    @Column(name = "is_read") private Boolean read = false;
}
