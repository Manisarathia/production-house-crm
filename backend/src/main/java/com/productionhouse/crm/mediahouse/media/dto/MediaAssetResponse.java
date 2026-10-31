package com.productionhouse.crm.mediahouse.media.dto;
import java.time.Instant;
public record MediaAssetResponse(Long id,String name,String description,String projectRef,String assetType,String status,String storageReference,String format,Long sizeBytes,Long durationSeconds,String notes,boolean active,Instant createdAt,Instant updatedAt){}
