package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Attendance extends BaseEntity {
    @NotBlank(message = "Crew member is required") private String crewMember;
    private String role;
    @NotNull(message = "Date is required")
    @Column(name = "attendance_date")
    private LocalDate date;
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "present|late|absent|on-leave", message = "Invalid status")
    private String status;
    private String checkIn;
    private String checkOut;
}
