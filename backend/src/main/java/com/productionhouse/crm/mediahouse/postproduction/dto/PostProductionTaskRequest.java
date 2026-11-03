package com.productionhouse.crm.mediahouse.postproduction.dto;
import jakarta.validation.constraints.*;import java.time.LocalDate;
import com.productionhouse.crm.task5.ImageDataLimits;
public record PostProductionTaskRequest(@NotBlank @Size(max=200) String name,@Size(max=2000) String description,@Size(max=120) String projectRef,@Positive Long mediaId,@Positive Long assigneeId,@NotBlank String status,@Size(max=40) String priority,LocalDate startedAt,LocalDate dueAt,LocalDate completedAt,@Size(max=2000) String notes,Boolean active,@Size(max=ImageDataLimits.MAX_IMAGE_DATA_CHARS) String image){
public PostProductionTaskRequest(String name,String description,String projectRef,Long mediaId,Long assigneeId,String status,String priority,LocalDate startedAt,LocalDate dueAt,LocalDate completedAt,String notes,Boolean active){this(name,description,projectRef,mediaId,assigneeId,status,priority,startedAt,dueAt,completedAt,notes,active,null);}
}
