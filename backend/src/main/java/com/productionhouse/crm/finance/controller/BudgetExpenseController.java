package com.productionhouse.crm.finance.controller;

import com.productionhouse.crm.finance.model.Budget;
import com.productionhouse.crm.finance.model.Expense;
import com.productionhouse.crm.finance.model.ExpenseStatus;
import com.productionhouse.crm.finance.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/budgets")
@CrossOrigin(origins = "*")
public class BudgetExpenseController {

    @Autowired
    private FinanceService financeService;

    @PostMapping("/initialize")
    public ResponseEntity<Budget> initializeProjectBudget(@RequestBody Map<String, Object> payload) {
        String projectId = (String) payload.get("projectId");
        BigDecimal totalAllocated = new BigDecimal(payload.get("totalAllocated").toString());
        
        Budget budget = financeService.initializeBudget(projectId, totalAllocated);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<Budget> getProjectBudget(@PathVariable String projectId) {
        return ResponseEntity.ok(financeService.getBudgetByProject(projectId));
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> logExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.logExpense(expense));
    }
    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(financeService.getAllExpensesList());
    }

    @GetMapping("/project/{projectId}/expenses")
    public ResponseEntity<List<Expense>> getProjectExpenses(@PathVariable String projectId) {
        return ResponseEntity.ok(financeService.getExpensesByProject(projectId));
    }

    @PatchMapping("/expenses/{expenseId}/status")
    public ResponseEntity<Expense> approveOrRejectExpense(
            @PathVariable String expenseId, 
            @RequestParam ExpenseStatus status) {
        return ResponseEntity.ok(financeService.updateExpenseStatus(expenseId, status));
    }
}
