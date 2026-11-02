package com.productionhouse.crm.audio.singer.dto;
import java.time.Instant;
public record SingerResponse(Long id,String name,String email,String phone,String languages,String voiceType,String voiceRange,String biography,String status,boolean active,Instant createdAt,Instant updatedAt){}
