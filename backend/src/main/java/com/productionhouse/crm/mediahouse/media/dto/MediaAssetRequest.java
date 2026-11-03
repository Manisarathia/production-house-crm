package com.productionhouse.crm.mediahouse.media.dto;
import jakarta.validation.constraints.*;
import com.productionhouse.crm.task5.ImageDataLimits;
public record MediaAssetRequest(@NotBlank @Size(max=200) String name,@Size(max=2000) String description,@Size(max=120) String projectRef,@NotBlank @Size(max=40) String assetType,@NotBlank @Size(max=40) String status,@Size(max=500) String storageReference,@Size(max=40) String format,@PositiveOrZero Long sizeBytes,@PositiveOrZero Long durationSeconds,@Size(max=2000) String notes,Boolean active,@Size(max=ImageDataLimits.MAX_IMAGE_DATA_CHARS) String image){
public MediaAssetRequest(String name,String description,String projectRef,String assetType,String status,String storageReference,String format,Long sizeBytes,Long durationSeconds,String notes,Boolean active){this(name,description,projectRef,assetType,status,storageReference,format,sizeBytes,durationSeconds,notes,active,null);}
}
