package com.productionhouse.crm.mediahouse.postproduction.dto;
import jakarta.validation.constraints.*;import java.time.LocalDate;
public record PostProductionTaskRequest(@NotBlank @Size(max=200) String name,@Size(max=2000) String description,@Size(max=120) String projectRef,@Positive Long mediaId,@Positive Long assigneeId,@NotBlank String status,@Size(max=40) String priority,LocalDate startedAt,LocalDate dueAt,LocalDate completedAt,@Size(max=2000) String notes,Boolean active){}
