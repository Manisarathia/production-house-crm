package com.productionhouse.crm.finance.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class BudgetResponse {
	private BigDecimal totalAllocated;
	private BigDecimal totalSpent;
	private double globalBurnRate;
	private BigDecimal remainingRunway;
	private List<Budget> projectBudgets;
	private Map<String, BigDecimal> categoryCostDistribution;
}
