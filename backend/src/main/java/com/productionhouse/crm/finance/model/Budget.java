package com.productionhouse.crm.finance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Data
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "project_id", unique = true, nullable = false)
    private String projectId;

    @Column(name = "total_allocated", nullable = false)
    private BigDecimal totalAllocated;

    @Column(name = "total_spent", nullable = false)
    private BigDecimal totalSpent = BigDecimal.ZERO;
}
