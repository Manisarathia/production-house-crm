package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Task extends BaseEntity {
    @NotBlank(message = "Task title is required") private String title;
    @NotBlank(message = "Assignee is required") private String assignee;
    private String department;
    @Pattern(regexp = "^(low|medium|high)?$", message = "Invalid priority") private String priority;
    private LocalDate dueDate;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "todo|in-progress|done", message = "Invalid status")
    private String status;
    @Column(length = 2000) private String description;
}
