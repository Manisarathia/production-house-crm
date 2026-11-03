package com.productionhouse.crm.audio.singer.dto;
import java.time.Instant;
public record SingerResponse(Long id,String name,String email,String phone,String languages,String voiceType,String voiceRange,String biography,String status,boolean active,String musicDirector,String lyricist,String duration,String recordingStudio,java.math.BigDecimal fee,String isrcCode,java.time.LocalDate releaseDate,Instant createdAt,Instant updatedAt,String image){}
