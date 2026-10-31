package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class Location extends BaseEntity {
    @NotBlank(message = "Location name is required") private String name;
    @NotBlank(message = "Address is required") private String address;
    private String contactPerson;
    @Pattern(regexp = "^([0-9+\\-\\s()]{7,20})?$", message = "Enter a valid phone number")
    private String phone;
    private String permitNumber;
    @NotBlank(message = "Permit status is required")
    @Pattern(regexp = "pending|approved|rejected|expired", message = "Invalid permit status")
    private String permitStatus;
    private LocalDate permitExpiry;
}
