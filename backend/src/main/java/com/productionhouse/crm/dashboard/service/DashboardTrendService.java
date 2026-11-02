package com.productionhouse.crm.dashboard.service;

import com.productionhouse.crm.dashboard.api.dto.DashboardTrendPoint;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.finance.model.Budget;
import com.productionhouse.crm.finance.model.Invoice;
import com.productionhouse.crm.finance.model.Payment;
import com.productionhouse.crm.finance.repository.BudgetRepository;
import com.productionhouse.crm.finance.repository.InvoiceRepository;
import com.productionhouse.crm.finance.repository.PaymentRepository;
import com.productionhouse.crm.production.model.Project;
import com.productionhouse.crm.production.model.ProductionStage;
import com.productionhouse.crm.production.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardTrendService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardTrendService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            BudgetRepository budgetRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.budgetRepository = budgetRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<DashboardTrendPoint> getLastSixMonths() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        List<Project> projects = projectRepository.findAll();
        List<DashboardTrendPoint> trends = new ArrayList<>(6);

        for (int monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
            YearMonth month = currentMonth.minusMonths(monthsAgo);
            LocalDate asOfDate = month.equals(currentMonth) ? today : month.atEndOfMonth();
            long activeProductions = projects.stream()
                    .filter(project -> project.getStage() != ProductionStage.RELEASED)
                    .filter(project -> !project.getStartDate().isAfter(asOfDate))
                    .filter(project -> project.getEndDate() == null || !project.getEndDate().isBefore(asOfDate))
                    .count();
            long teamMembers = userRepository.countByCreatedAtBefore(
                    asOfDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
            );

            if (month.equals(currentMonth)) {
                BigDecimal totalBudget = budgetRepository.findAll().stream()
                        .map(Budget::getTotalAllocated)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                List<Invoice> invoices = invoiceRepository.findAll();
                long pendingInvoices = 0;
                long overdueInvoices = 0;
                for (Invoice invoice : invoices) {
                    BigDecimal paid = paymentRepository.findByInvoiceId(invoice.getId()).stream()
                            .map(Payment::getAmountPaid)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    if (paid.compareTo(invoice.getAmountDue()) < 0) {
                        pendingInvoices++;
                        if (invoice.getDueDate().isBefore(today)) {
                            overdueInvoices++;
                        }
                    }
                }
                trends.add(new DashboardTrendPoint(
                        month.toString(),
                        activeProductions,
                        teamMembers,
                        totalBudget,
                        pendingInvoices,
                        overdueInvoices
                ));
            } else {
                trends.add(new DashboardTrendPoint(
                        month.toString(),
                        activeProductions,
                        teamMembers,
                        null,
                        null,
                        null
                ));
            }
        }
        return List.copyOf(trends);
    }
}
