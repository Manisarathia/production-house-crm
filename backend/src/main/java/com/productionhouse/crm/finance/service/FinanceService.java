package com.productionhouse.crm.finance.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.productionhouse.crm.finance.model.Budget;
import com.productionhouse.crm.finance.model.Expense;
import com.productionhouse.crm.finance.model.ExpenseStatus;
import com.productionhouse.crm.finance.repository.BudgetRepository;
import com.productionhouse.crm.finance.repository.ExpenseRepository;

@Service
@Transactional
public class FinanceService {

	@Autowired
	private BudgetRepository budgetRepository;

	@Autowired
	private ExpenseRepository expenseRepository;

	public Budget initializeBudget(String projectId, BigDecimal totalAllocated) {
		Budget budget = new Budget();
		budget.setProjectId(projectId);
		budget.setTotalAllocated(totalAllocated);
		budget.setTotalSpent(BigDecimal.ZERO);
		return budgetRepository.save(budget);
	}

	public Expense logExpense(Expense expense) {
		if (expense.getProject() == null || expense.getProject().getId() == null) {
			throw new IllegalArgumentException(
					"Cannot log an expenditure line item without a valid assigned Project context.");
		}

		String targetProjectId = expense.getProject().getId();

		budgetRepository.findByProjectId(targetProjectId).orElseGet(() -> {
			Budget defaultBudget = new Budget();
			defaultBudget.setProjectId(targetProjectId);
			defaultBudget.setTotalAllocated(new BigDecimal("5000000.00"));
			defaultBudget.setTotalSpent(BigDecimal.ZERO);
			return budgetRepository.save(defaultBudget);
		});

		return expenseRepository.save(expense);
	}

	public Expense updateExpenseStatus(String expenseId, ExpenseStatus status) {
		Expense expense = expenseRepository.findById(expenseId)
				.orElseThrow(() -> new RuntimeException("Expense record not found with ID: " + expenseId));

		if (expense.getProject() == null || expense.getProject().getId() == null) {
			throw new IllegalStateException(
					"Corrupted Record: Target expense trace missing a valid parent Project key link.");
		}

		String targetProjectId = expense.getProject().getId();

		if (status == ExpenseStatus.APPROVED && expense.getStatus() != ExpenseStatus.APPROVED) {
			Budget budget = budgetRepository.findByProjectId(targetProjectId)
					.orElseThrow(() -> new RuntimeException("Budget profiles missing for project: " + targetProjectId));

			BigDecimal updatedSpent = budget.getTotalSpent().add(expense.getAmount());

			if (updatedSpent.compareTo(budget.getTotalAllocated()) > 0) {
				System.out.println("[WARNING] Project budget threshold breached for Project ID: " + targetProjectId);
			}

			budget.setTotalSpent(updatedSpent);
			budgetRepository.save(budget);
		}

		else if (status != ExpenseStatus.APPROVED && expense.getStatus() == ExpenseStatus.APPROVED) {
			Budget budget = budgetRepository.findByProjectId(targetProjectId).orElseThrow(() -> new RuntimeException(
					"Budget profile tracker not found for project path: " + targetProjectId));

			budget.setTotalSpent(budget.getTotalSpent().subtract(expense.getAmount()));
			budgetRepository.save(budget);
		}

		expense.setStatus(status);
		return expenseRepository.save(expense);
	}

	public Budget getBudgetByProject(String projectId) {
		return budgetRepository.findByProjectId(projectId).orElseThrow(
				() -> new RuntimeException("Budget context mapping profile not found for identifier: " + projectId));
	}

	public List<Expense> getExpensesByProject(String projectId) {
		return expenseRepository.findByProjectIdWithProject(projectId);
	}

	public List<Expense> getAllExpensesList() {
		return expenseRepository.findAll();
	}

}
