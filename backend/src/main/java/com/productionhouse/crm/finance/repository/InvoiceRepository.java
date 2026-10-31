package com.productionhouse.crm.finance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.productionhouse.crm.finance.model.Invoice;
import com.productionhouse.crm.finance.model.InvoiceResponse;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

	List<Invoice> findByProjectId(String projectId);

	@Query(value = "SELECT i.id as id, i.invoice_number as invoiceNumber, i.issued_to as issuedTo, "
			+ "i.amount_due as amountDue, i.due_date as dueDate, CAST(i.status AS CHAR) as status, "
			+ "i.project_id as projectId, p.title as projectName " +
			"FROM invoices i " + "INNER JOIN projects p ON i.project_id = p.id "
			+ "ORDER BY i.invoice_number DESC", nativeQuery = true)
	List<InvoiceResponse> findAllInvoicesWithProjectNames();

	@Query(value = "SELECT i.id as id, i.invoice_number as invoiceNumber, i.issued_to as issuedTo, "
			+ "i.amount_due as amountDue, i.due_date as dueDate, CAST(i.status AS CHAR) as status, "
			+ "i.project_id as projectId, p.title as projectName " +
			"FROM invoices i " + "INNER JOIN projects p ON i.project_id = p.id " + "WHERE i.project_id = :projectId "
			+ "ORDER BY i.invoice_number DESC", nativeQuery = true)
	List<InvoiceResponse> findInvoicesWithProjectNamesByProjectId(@Param("projectId") String projectId);
}
