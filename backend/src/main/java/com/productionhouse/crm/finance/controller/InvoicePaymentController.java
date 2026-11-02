package com.productionhouse.crm.finance.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.productionhouse.crm.finance.model.Invoice;
import com.productionhouse.crm.finance.model.InvoiceResponse;
import com.productionhouse.crm.finance.model.Payment;
import com.productionhouse.crm.finance.model.PaymentStatus;
import com.productionhouse.crm.finance.repository.InvoiceRepository;
import com.productionhouse.crm.finance.repository.PaymentRepository;
import com.productionhouse.crm.finance.service.InvoiceService;
import com.productionhouse.crm.production.repository.ProjectRepository;

@RestController
@RequestMapping("/api/finance/invoices")
@CrossOrigin(origins = "*")
public class InvoicePaymentController {
	@Autowired
	private InvoiceService invoiceService;
	@Autowired
	private ProjectRepository projectRepository;
	@Autowired
	private InvoiceRepository invoiceRepository;
	@Autowired
	private PaymentRepository paymentRepository;

	private BigDecimal totalPaid(String invoiceId) {
		return paymentRepository.findByInvoiceId(invoiceId).stream().map(Payment::getAmountPaid).reduce(BigDecimal.ZERO,
				BigDecimal::add);
	}

	@GetMapping("/project/{projectId}")
	public ResponseEntity<List<Invoice>> getInvoicesByProject(@PathVariable String projectId) {
		return ResponseEntity.ok(invoiceService.findByProjectId(projectId));
	}

	@GetMapping
	@Transactional
	public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
		List<Invoice> invoices = invoiceService.findAll();
		LocalDate today = LocalDate.now();
		for (Invoice invoice : invoices) {
			BigDecimal paid = totalPaid(invoice.getId());
			PaymentStatus correctStatus;
			if (paid.compareTo(invoice.getAmountDue()) >= 0)
				correctStatus = PaymentStatus.PAID;
			else if (invoice.getDueDate().isBefore(today))
				correctStatus = PaymentStatus.OVERDUE;
			else if (paid.signum() > 0)
				correctStatus = PaymentStatus.PARTIAL;
			else
				correctStatus = PaymentStatus.UNPAID;
			if (invoice.getStatus() != correctStatus)
				invoice.setStatus(correctStatus);
		}
		invoiceRepository.flush();
		return ResponseEntity.ok(invoiceRepository.findAllInvoicesWithProjectNames());
	}

	@PostMapping
	@Transactional
	public ResponseEntity<?> generateInvoice(@RequestBody Map<String, Object> payload) {
		try {
			if (payload.get("projectId") == null || payload.get("issuedTo") == null || payload.get("amountDue") == null)
				return ResponseEntity.badRequest().body(Map.of("error", "Missing mandatory billing fields."));
			String projectId = payload.get("projectId").toString();
			if (!projectRepository.existsById(projectId))
				return ResponseEntity.badRequest().body(Map.of("error", "Invalid production project ID"));
			String issuedTo = payload.get("issuedTo").toString().trim();
			if (issuedTo.isEmpty())
				return ResponseEntity.badRequest().body(Map.of("error", "Vendor is required."));
			BigDecimal due = new BigDecimal(payload.get("amountDue").toString());
			if (due.signum() <= 0)
				return ResponseEntity.badRequest().body(Map.of("error", "Invoice amount must be positive."));
			Invoice invoice = new Invoice();
			invoice.setProjectId(projectId);
			invoice.setIssuedTo(issuedTo);
			invoice.setAmountDue(due);
			// Unique even if earlier invoices have been deleted; the UI displays this
			// generated number.
			invoice.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-"
					+ java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
			invoice.setDueDate(payload.get("dueDate") == null ? LocalDate.now().plusDays(14)
					: LocalDate.parse(payload.get("dueDate").toString()));
			invoice.setStatus(
					invoice.getDueDate().isBefore(LocalDate.now()) ? PaymentStatus.OVERDUE : PaymentStatus.UNPAID);
			return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.save(invoice));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("error", "Invalid invoice amount or due date."));
		}
	}

	@GetMapping("/{invoiceId}/payments")
	public ResponseEntity<?> getPayments(@PathVariable String invoiceId) {
		if (!invoiceRepository.existsById(invoiceId))
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Invoice not found."));
		List<Payment> payments = paymentRepository.findByInvoiceId(invoiceId);
		return ResponseEntity.ok(payments.stream().map(p -> Map.of("id", p.getId(), "amountPaid", p.getAmountPaid(),
				"paymentDate", p.getPaymentDate(), "method", p.getMethod())).toList());
	}

	@PostMapping("/{invoiceId}/payments")
	@Transactional
	public ResponseEntity<?> processPayment(@PathVariable String invoiceId, @RequestBody Map<String, Object> payload) {
		Optional<Invoice> found = invoiceService.findById(invoiceId);
		if (found.isEmpty())
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Invoice not found."));
		Invoice invoice = found.get();
		if (payload.get("amountPaid") == null)
			return ResponseEntity.badRequest().body(Map.of("error", "Payment amount is required."));
		BigDecimal amount;
		try {
			amount = new BigDecimal(payload.get("amountPaid").toString());
		} catch (NumberFormatException e) {
			return ResponseEntity.badRequest().body(Map.of("error", "Invalid payment amount."));
		}
		if (amount.signum() <= 0)
			return ResponseEntity.badRequest().body(Map.of("error", "Payment amount must be greater than zero."));
		BigDecimal alreadyPaid = totalPaid(invoiceId);
		BigDecimal balance = invoice.getAmountDue().subtract(alreadyPaid);
		if (balance.signum() <= 0)
			return ResponseEntity.badRequest().body(Map.of("error", "Invoice is already fully paid."));
		if (amount.compareTo(balance) > 0)
			return ResponseEntity.badRequest().body(Map.of("error", "Payment exceeds remaining balance: " + balance));
		String method = payload.get("method") == null ? "Bank Transfer" : payload.get("method").toString().trim();
		if (method.isEmpty())
			method = "Bank Transfer";
		Payment payment = new Payment();
		payment.setInvoice(invoice);
		payment.setAmountPaid(amount);
		payment.setMethod(method);
		paymentRepository.save(payment);
		BigDecimal total = alreadyPaid.add(amount);
		PaymentStatus status = total.compareTo(invoice.getAmountDue()) >= 0 ? PaymentStatus.PAID
				: invoice.getDueDate().isBefore(LocalDate.now()) ? PaymentStatus.OVERDUE : PaymentStatus.PARTIAL;
		invoice.setStatus(status);
		invoiceService.save(invoice);
		return ResponseEntity.ok(Map.of("message", "Payment recorded successfully.", "status", status.name(),
				"totalPaid", total, "balanceAmount", invoice.getAmountDue().subtract(total)));
	}
}
