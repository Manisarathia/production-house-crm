package com.productionhouse.crm.legal.contracts.dto;
import java.time.*;
public record ContractResponse(Long id,String name,String projectRef,String contractType,java.math.BigDecimal contractValue,String partyOne,String partyTwo,String governingLaw,Long mediaId,String status,LocalDate startsAt,LocalDate endsAt,LocalDate renewalAt,String documentReference,boolean active,Instant createdAt,Instant updatedAt,String image){}
