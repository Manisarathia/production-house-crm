package com.productionhouse.crm.legal.contracts.dto;
import java.time.*;
public record ContractResponse(Long id,String name,String projectRef,String contractType,String partyOne,String partyTwo,Long mediaId,String status,LocalDate startsAt,LocalDate endsAt,LocalDate renewalAt,String documentReference,boolean active,Instant createdAt,Instant updatedAt){}
