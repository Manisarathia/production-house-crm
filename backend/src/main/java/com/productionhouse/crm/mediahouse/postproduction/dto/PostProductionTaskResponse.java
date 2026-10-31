package com.productionhouse.crm.mediahouse.postproduction.dto;
import java.time.*;
public record PostProductionTaskResponse(Long id,String name,String description,String projectRef,Long mediaId,Long assigneeId,String assigneeName,String status,String priority,LocalDate startedAt,LocalDate dueAt,LocalDate completedAt,String notes,boolean active,Instant createdAt,Instant updatedAt){}
