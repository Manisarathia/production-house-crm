package com.productionhouse.crm.audio.dubbing.dto;
import java.time.*;
public record DubbingSessionResponse(Long id,String name,String projectRef,Long singerId,String singerName,Long mediaId,LocalDateTime scheduledAt,LocalDateTime endsAt,String studio,String language,String status,String notes,boolean active,Instant createdAt,Instant updatedAt){}
