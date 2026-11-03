package com.productionhouse.crm.audio.dubbing.dto;
import jakarta.validation.constraints.*;import java.time.LocalDateTime;
import com.productionhouse.crm.task5.ImageDataLimits;
public record DubbingSessionRequest(@NotBlank @Size(max=200) String name,@Size(max=120) String projectRef,@Positive @NotNull Long singerId,@Positive Long mediaId,@NotNull LocalDateTime scheduledAt,@NotNull LocalDateTime endsAt,@NotBlank @Size(max=120) String studio,@NotBlank @Size(max=100) String language,@NotBlank @Size(max=40) String status,@Size(max=2000) String notes,Boolean active,@Size(max=ImageDataLimits.MAX_IMAGE_DATA_CHARS) String image){
public DubbingSessionRequest(String name,String projectRef,Long singerId,Long mediaId,LocalDateTime scheduledAt,LocalDateTime endsAt,String studio,String language,String status,String notes,Boolean active){this(name,projectRef,singerId,mediaId,scheduledAt,endsAt,studio,language,status,notes,active,null);}
}
