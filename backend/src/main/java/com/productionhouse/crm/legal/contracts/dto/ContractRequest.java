package com.productionhouse.crm.legal.contracts.dto;
import jakarta.validation.constraints.*;import java.time.LocalDate;
public record ContractRequest(@NotBlank @Size(max=200) String name,@Size(max=2000) String description,@Size(max=120) String projectRef,@NotBlank @Size(max=80) String contractType,@NotBlank @Size(max=200) String partyOne,@Size(max=200) String partyTwo,@Positive Long mediaId,@NotBlank @Size(max=40) String status,@NotNull LocalDate startsAt,LocalDate endsAt,LocalDate renewalAt,@Size(max=500) String documentReference,@Size(max=2000) String notes,Boolean active){}
