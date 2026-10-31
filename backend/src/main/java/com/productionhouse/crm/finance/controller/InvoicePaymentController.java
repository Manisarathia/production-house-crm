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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.productionhouse.crm.finance.model.Invoice;
import com.productionhouse.crm.finance.model.InvoiceResponse;
import com.productionhouse.crm.finance.model.Payment;
import com.productionhouse.crm.finance.model.PaymentStatus;
import com.productionhouse.crm.finance.repository.InvoiceRepository;
import com.productionhouse.crm.finance.repository.PaymentRepository;
import com.productionhouse.crm.finance.service.InvoiceService;

@RestController
@RequestMapping("/api/finance/invoices")
@CrossOrigin(origins = "*")
public class InvoicePaymentController {

	@Autowired
	private InvoiceService invoiceService;

	@Autowired
	private InvoiceRepository invoiceRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@GetMapping("/project/{projectId}")
	public ResponseEntity<List<Invoice>> getInvoicesByProject(@PathVariable String projectId) {
		List<Invoice> invoices = invoiceService.findByProjectId(projectId);
		return ResponseEntity.ok(invoices);
	}

	@GetMapping
	@Transactional
	public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
		List<Invoice> baseEntities = invoiceService.findAll();
		LocalDate today = LocalDate.now();
		boolean needsDatabaseUpdate = false;
		for (Invoice invoice : baseEntities) {
			if ((invoice.getStatus() == PaymentStatus.UNPAID || invoice.getStatus() == PaymentStatus.PARTIAL)
					&& invoice.getDueDate().isBefore(today)) {

				invoice.setStatus(PaymentStatus.OVERDUE);
				needsDatabaseUpdate = true;
			}
		}
		if (needsDatabaseUpdate) {
			invoiceRepository.saveAll(baseEntities);
			invoiceRepository.flush();
		}
		List<InvoiceResponse> detailedInvoices = invoiceRepository.findAllInvoicesWithProjectNames();
		return ResponseEntity.ok(detailedInvoices);
	}

	@PostMapping
	@Transactional
	public ResponseEntity<?> generateInvoice(@RequestBody Map<String, Object> payload) {
		try {
			if (!payload.containsKey("projectId") || !payload.containsKey("issuedTo")
					|| !payload.containsKey("amountDue")) {
				return ResponseEntity.badRequest().body(Map.of("error", "Missing mandatory billing fields."));
			}

			Invoice invoice = new Invoice();
			invoice.setProjectId((String) payload.get("projectId"));
			invoice.setIssuedTo((String) payload.get("issuedTo"));

			BigDecimal amountDue = new BigDecimal(payload.get("amountDue").toString());
			invoice.setAmountDue(amountDue);

			long currentCount = invoiceService.count();
			int currentYear = LocalDate.now().getYear();
			String generatedInvoiceNum = "INV-" + currentYear + "-" + String.format("%03d", currentCount + 42);
			invoice.setInvoiceNumber(generatedInvoiceNum);

			invoice.setInvoiceNumber(generatedInvoiceNum);

			if (payload.containsKey("dueDate") && payload.get("dueDate") != null) {
				invoice.setDueDate(LocalDate.parse((String) payload.get("dueDate")));
			} else {
				invoice.setDueDate(LocalDate.now().plusDays(14));
			}
			invoice.setStatus(PaymentStatus.UNPAID);

			Invoice savedInvoice = invoiceService.save(invoice);
			return ResponseEntity.status(HttpStatus.CREATED).body(savedInvoice);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "Failure processing invoice registration stream: " + e.getMessage()));
		}
	}

	@PostMapping("/{invoiceId}/payments")
	@Transactional
	public ResponseEntity<?> processPayment(@PathVariable String invoiceId, @RequestBody Map<String, Object> payload) {
		try {
			Optional<Invoice> invoiceOpt = invoiceService.findById(invoiceId);
			if (invoiceOpt.isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("error", "Target billing ledger item not found."));
			}

			Invoice invoice = invoiceOpt.get();
			if (invoice.getStatus() == PaymentStatus.PAID) {
				return ResponseEntity.badRequest()
						.body(Map.of("error", "Payment operation declined: Invoice is already fully paid."));
			}

			BigDecimal amountPaid = new BigDecimal(payload.get("amountPaid").toString());
			String method = payload.containsKey("method") ? (String) payload.get("method") : "Bank Transfer";

			Payment payment = new Payment();
			payment.setInvoice(invoice);
			payment.setAmountPaid(amountPaid);
			payment.setMethod(method);
			paymentRepository.save(payment);

			BigDecimal totalPaidSoFar = invoice.getPayments().stream().map(Payment::getAmountPaid)
					.reduce(BigDecimal.ZERO, BigDecimal::add).add(amountPaid);

			if (totalPaidSoFar.compareTo(invoice.getAmountDue()) >= 0) {
				invoice.setStatus(PaymentStatus.PAID);
			} else if (totalPaidSoFar.compareTo(BigDecimal.ZERO) > 0) {
				invoice.setStatus(PaymentStatus.PARTIAL);
			}

			invoiceService.save(invoice);
			return ResponseEntity
					.ok(Map.of("message", "Payment ledger updated successfully.", "status", invoice.getStatus()));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "Failure recording receipt payment path: " + e.getMessage()));
		}
	}
}
