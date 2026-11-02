package com.productionhouse.crm.audio.singer.dto;
import jakarta.validation.constraints.*;
public record SingerRequest(@NotBlank @Size(max=200) String name,@Email @Size(max=254) String email,@Size(max=40) String phone,@Size(max=500) String languages,@Size(max=80) String voiceType,@Size(max=80) String voiceRange,@Size(max=2000) String biography,@NotBlank @Size(max=40) String status,Boolean active){}
