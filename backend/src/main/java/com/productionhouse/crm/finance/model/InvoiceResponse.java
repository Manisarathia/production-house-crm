package com.productionhouse.crm.finance.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InvoiceResponse {
    String getId();
    String getInvoiceNumber();
    String getIssuedTo();
    BigDecimal getAmountDue();
    LocalDate getDueDate();
    String getStatus();
    String getProjectId();
    String getProjectName();
}
