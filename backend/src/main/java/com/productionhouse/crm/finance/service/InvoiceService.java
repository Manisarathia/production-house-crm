package com.productionhouse.crm.finance.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.productionhouse.crm.finance.model.Invoice;
import com.productionhouse.crm.finance.repository.InvoiceRepository;

@Service
@Transactional
public class InvoiceService {
	@Autowired
	private InvoiceRepository invoiceRepository;

	public List<Invoice> findByProjectId(String projectId) {
		return invoiceRepository.findByProjectId(projectId);
	}

	public List<Invoice> findAll() {
		return invoiceRepository.findAll();
	}

	public long count() {
		return invoiceRepository.count();
	}

	public Invoice save(Invoice invoice) {
		return invoiceRepository.save(invoice);
	}

	public Optional<Invoice> findById(String invoiceId) {
		return invoiceRepository.findById(invoiceId);
	}

}
