import { useState, useEffect } from 'react';
import { Plus, Search, ReceiptText, X, Download } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/finance/invoices';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function InvoicesPayments() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [issuedTo, setIssuedTo] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [projectId, setProjectId] = useState('ALL');


  const fetchInvoices = async () => {
  try {
    const response = await fetch(API_BASE_URL); 
    if (response.ok) {
      const data = await response.json();
      console.log("Live API Data Array payload:", data); // Check your browser inspector console!
      setItems(data);
    } else {
      console.error("Failed to query invoice logs matrix from server.");
    }
  } catch (error) {
    console.error("Network interface connection failure fetching invoices:", error);
  }
};


  useEffect(() => {
    const synchronizeInvoicesGrid = async () => {
      setLoading(true);
      await fetchInvoices();
      setLoading(false);
    };
    synchronizeInvoicesGrid();
  }, []);

  async function addInvoice(e) {
  e.preventDefault();
  
  const currentYear = new Date().getFullYear();
  const generatedInvoiceNum = `INV-${currentYear}-${String(items.length + 42).padStart(3, '0')}`;

  // Use a local constant for the payload calculation to avoid stale states
  const targetProject = projectId === 'ALL' ? 'proj-uuid-101' : projectId;

  const payload = {
    projectId: targetProject, // Resolves structural tracking conflicts
    invoiceNumber: generatedInvoiceNum,
    issuedTo: issuedTo,
    amountDue: parseFloat(amountDue),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'UNPAID'
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setIssuedTo('');
      setAmountDue('');
      setShow(false);
      
      setProjectId('ALL'); 
      
      await fetchInvoices(); 
    } else {
      alert("Failed to submit billing invoice payload to database.");
    }
  } catch (error) {
    console.error("Failure processing invoice registration stream:", error);
  }
}

  async function processPayment(invoiceId, totalValueAmount) {
    const payload = {
      amountPaid: parseFloat(totalValueAmount),
      method: 'Bank Transfer'
    };
    try {
      const response = await fetch(`${API_BASE_URL}/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchInvoices();
      } else {
        alert("Payment workflow operation declined by backend context rule checks.");
      }
    } catch (error) {
      console.error("Failure recording receipt payment execution path:", error);
    }
  }

  function exportCsv() {
    const rows = [
      ['Invoice ID', 'Vendor', 'Project', 'Amount Due', 'Due Date', 'Status'],
      ...items.map((item) => [item.invoiceNumber, item.issuedTo, item.projectName || 'General Production', item.amountDue, item.dueDate, item.status]),
    ];
    const csvContent = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_register_project_${projectId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const list = items.filter((item) =>
    (`${item.invoiceNumber || ''}${item.issuedTo || ''}${item.projectName || ''}${item.status || ''}`)
      .toLowerCase().includes(q.toLowerCase())
  );

  const outstandingBalance = items
    .filter((item) => item.status !== 'PAID')
    .reduce((total, item) => total + Number(item.amountDue), 0);

  const paidThisMonthAmount = items
    .filter((item) => item.status === 'PAID')
    .reduce((total, item) => total + Number(item.amountDue), 0);

  const overdueInvoicesCount = items.filter((item) => item.status === 'OVERDUE').length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FINANCE &amp; RESOURCES</div>
          <h1>Invoices &amp; Payments</h1>
          <p>Generate invoices, monitor real-time payment status frameworks, and keep vendors paid on time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShow(true)}>
          <Plus size={18} /> Create invoice
        </button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <span>Total invoices</span>
          <strong>{loading ? '...' : items.length}</strong>
        </div>
        <div className="mini-stat">
          <span>Outstanding balance</span>
          <strong>{loading ? '...' : fmt(outstandingBalance)}</strong>
        </div>
        <div className="mini-stat">
          <span>Paid this lifecycle</span>
          <strong>{loading ? '...' : fmt(paidThisMonthAmount)}</strong>
        </div>
        <div className="mini-stat">
          <span>Overdue invoices</span>
          <strong>{loading ? '...' : overdueInvoicesCount}</strong>
        </div>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div>
            <h2>Invoice register</h2>
            <p>All system tracking vendor invoices and their structural real-time payment status.</p>
          </div>
          <div className="inline-actions">
            <label className="table-search">
              <Search size={16} />
              <input
                placeholder="Search invoices..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <button className="btn btn-light" onClick={exportCsv}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>INVOICE ID</th>
                <th>VENDOR </th>
                <th>PROJECT </th>
                <th>AMOUNT DUE</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th> ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>Synchronizing system ledgers...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No ledger items match the active evaluation filters.</td></tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td><strong className="invoice-id">{item.invoiceNumber || 'INV-TEMP'}</strong></td>
                    <td>{item.issuedTo}</td>
                    <td><strong>{item.projectName || 'General Production'}</strong></td>
                    <td><strong>{fmt(item.amountDue)}</strong></td>
                    <td>{item.dueDate}</td>
                    <td>
                      <span className={`status-pill ${item.status === 'PAID' ? 'green' : item.status === 'OVERDUE' ? 'red' : 'orange'}`}>
                        {item.status ? item.status.toLowerCase() : 'unpaid'}
                      </span>
                    </td>
                    <td>
                      {item.status !== 'PAID' ? (
                        <button className="approve-btn" onClick={() => processPayment(item.id, item.amountDue)}>
                          Mark paid
                        </button>
                      ) : (
                        <span className="muted">Completed Track</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INPUT FORM MODAL: REGISTER INVOICE */}
      {show && (
        <div className="modal-backdrop" onClick={() => setShow(false)}>
          <form className="modal-card" onSubmit={addInvoice} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Create invoice log entry</h2>
                <p>Register a vendor supplier invoice into core data tracking layers.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShow(false)}>
                <X size={18} />
              </button>
            </div>

            <label>
              Vendor name / Recipient Entity
              <input
                required
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                placeholder="Vendor or supplier company name"
              />
            </label>

            <label>
              Associated Production Project
              <select
                value={projectId === 'ALL' ? 'proj-uuid-101' : projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="proj-uuid-101">The Last Monsoon (ID: 101)</option>
                <option value="proj-uuid-102">City of Echoes (ID: 102)</option>
                <option value="proj-uuid-103">Beyond The Frame (ID: 103)</option>
              </select>
            </label>

            <label>
              Invoice amount due (INR)
              <input
                type="number"
                min="1"
                required
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                placeholder="e.g., 75000"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><ReceiptText size={16} /> Create invoice</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

