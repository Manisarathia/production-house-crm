package com.productionhouse.crm.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter @Setter
public class CallSheet extends BaseEntity {
    @NotBlank(message = "Title is required") private String title;
    @NotNull(message = "Shoot date is required") private LocalDate shootDate;
    @NotBlank(message = "General call time is required") private String generalCallTime;
    private String location;
    private String weather;
    @Column(length = 2000) private String scenes;
    @Column(length = 2000) private String notes;
}
