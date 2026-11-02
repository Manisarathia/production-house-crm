package com.productionhouse.crm.legal.rights.dto;
import java.time.*;
public record ContentRightResponse(Long id,String name,String description,String projectRef,String rightsType,Long mediaId,Long contractId,String territory,String platforms,String languages,boolean exclusive,LocalDate startsAt,LocalDate endsAt,String restrictions,String status,boolean active,String rightsPeriod,java.math.BigDecimal licenseFee,String revenueSharePct,Instant createdAt,Instant updatedAt){}
