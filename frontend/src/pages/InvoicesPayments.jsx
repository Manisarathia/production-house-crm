import { useState, useEffect } from 'react';
import { Plus, Search, ReceiptText, X, Download } from 'lucide-react';

const PROJECTS_API = 'http://localhost:8080/api/production/projects';
const VENDORS_API = 'http://localhost:8080/api/finance/vendors';

const API_BASE_URL = 'http://localhost:8080/api/finance/invoices';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function InvoicesPayments() {
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorLoadError, setVendorLoadError] = useState('');
  useEffect(() => {
    fetch(VENDORS_API)
      .then(async response => {
        if (!response.ok) throw new Error('Vendors API returned ' + response.status);
        return response.json();
      })
      .then(data => {
        setVendors(Array.isArray(data) ? data : []);
        setVendorLoadError('');
      })
      .catch(error => {
        console.error('Unable to load vendors:', error);
        setVendorLoadError('Unable to load vendors / suppliers');
      });
  }, []);
  const [projectLoadError, setProjectLoadError] = useState('');
  useEffect(() => {
    fetch(PROJECTS_API).then(async r => {
      if (!r.ok) throw new Error('Projects API returned ' + r.status);
      return r.json();
    })
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setProjectLoadError('Unable to load production projects');
      });
  }, []);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyInvoice, setHistoryInvoice] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paidTotals, setPaidTotals] = useState({});
  const [invoiceError, setInvoiceError] = useState('');

  const [issuedTo, setIssuedTo] = useState('');
  const [amountDue, setAmountDue] = useState('');
  const [projectId, setProjectId] = useState('');


  const fetchInvoices = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`Invoices API returned ${response.status}`);
      const data = await response.json();
      const invoices = Array.isArray(data) ? data : [];
      setItems(invoices);
      setInvoiceError('');
      const totals = await Promise.all(invoices.map(async item => {
        try {
          const res = await fetch(`${API_BASE_URL}/${item.id}/payments`);
          if (!res.ok) return [item.id, null];
          const payments = await res.json();
          return [item.id, Array.isArray(payments) ? payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0) : null];
        } catch { return [item.id, null]; }
      }));
      setPaidTotals(Object.fromEntries(totals));
    } catch (error) {
      console.error('Unable to fetch invoices:', error);
      setInvoiceError(error.message);
    }
  };

  const paidFor = (item) => paidTotals[item.id];
  const balanceFor = (item) => paidFor(item) == null ? null : Math.max(0, Number(item.amountDue) - paidFor(item));

  function openPayment(item) {
    setPaymentInvoice(item);
    setPaymentAmount(String(balanceFor(item) ?? ''));
    setPaymentMethod('Bank Transfer');
    setPaymentError('');
  }

  async function submitPayment(e) {
    e.preventDefault();
    if (!paymentInvoice || paymentBusy) return;
    const amount = Number(paymentAmount);
    const remaining = balanceFor(paymentInvoice);
    if (remaining == null || !Number.isFinite(amount) || amount <= 0 || amount > remaining + 0.001) {
      setPaymentError('Enter a positive payment amount within the remaining balance.');
      return;
    }
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const res = await fetch(`${API_BASE_URL}/${paymentInvoice.id}/payments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: amount, method: paymentMethod })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || `Payment failed (${res.status})`);
      setPaymentInvoice(null);
      await fetchInvoices();
    } catch (error) { setPaymentError(error.message); }
    finally { setPaymentBusy(false); }
  }

  async function showPaymentHistory(item) {
    setHistoryInvoice(item);
    setHistoryLoading(true);
    setPaymentHistory([]);
    try {
      const res = await fetch(`${API_BASE_URL}/${item.id}/payments`);
      if (!res.ok) throw new Error(`Payment history unavailable (${res.status})`);
      setPaymentHistory(await res.json());
    } catch (error) { setPaymentHistory([{ id: 'error', error: error.message }]); }
    finally { setHistoryLoading(false); }
  }

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

    if (!projectId) { alert('Select a production project first.'); return; }
    const targetProject = projectId;

    const payload = {
      projectId: targetProject,
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

        setProjectId('');

        await fetchInvoices();
      } else {
        alert("Failed to submit billing invoice payload to database.");
      }
    } catch (error) {
      console.error("Failure processing invoice registration stream:", error);
    }
  }


  function exportCsv() {
    if (loading || !balancesReady) {
      alert("Please wait until invoice payment balances have loaded before exporting.");
      return;
    }
    const rows = [
      ['Invoice ID', 'Vendor', 'Project', 'Amount Due', 'Paid Amount', 'Balance Amount', 'Due Date', 'Status'],
      ...items.map((item) => [
        item.invoiceNumber,
        item.issuedTo,
        item.projectName || 'General Production',
        item.amountDue,
        paidFor(item) == null ? 'Unavailable' : paidFor(item),
        balanceFor(item) == null ? 'Unavailable' : balanceFor(item),
        item.dueDate,
        item.status
      ]),
    ];
    const csvContent = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const exportStamp = `${timestamp.getFullYear()}-${pad(timestamp.getMonth() + 1)}-${pad(timestamp.getDate())}_${pad(timestamp.getHours())}-${pad(timestamp.getMinutes())}-${pad(timestamp.getSeconds())}`;
    link.download = `Invoice_Register_All_Projects_${exportStamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const list = items.filter((item) =>
    (`${item.invoiceNumber || ''}${item.issuedTo || ''}${item.projectName || ''}${item.status || ''}`)
      .toLowerCase().includes(q.toLowerCase())
  );

  const outstandingBalance = items.reduce((total, item) => total + (balanceFor(item) ?? 0), 0);
  const paidThisMonthAmount = items.reduce((total, item) => total + (paidFor(item) ?? 0), 0);
  const balancesReady = items.every(item => paidFor(item) != null);

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
          <strong>{loading ? '...' : balancesReady ? fmt(outstandingBalance) : '—'}</strong>
        </div>
        <div className="mini-stat">
          <span>Total paid (all time)</span>
          <strong>{loading ? '...' : balancesReady ? fmt(paidThisMonthAmount) : '—'}</strong>
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
            <button className="btn btn-light" onClick={exportCsv} disabled={loading || !balancesReady}>
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
                <th>PAID</th>
                <th>BALANCE</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: '#666' }}>Synchronizing system ledgers...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>No ledger items match the active evaluation filters.</td></tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td><strong className="invoice-id">{item.invoiceNumber || 'INV-TEMP'}</strong></td>
                    <td>{item.issuedTo}</td>
                    <td><strong>{item.projectName || 'General Production'}</strong></td>
                    <td><strong>{fmt(item.amountDue)}</strong></td>
                    <td>{paidFor(item) == null ? '—' : fmt(paidFor(item))}</td>
                    <td>{balanceFor(item) == null ? '—' : fmt(balanceFor(item))}</td>
                    <td>{item.dueDate}</td>
                    <td>
                      <span className={`status-pill ${item.status === 'PAID' ? 'green' : item.status === 'OVERDUE' ? 'red' : 'orange'}`}>
                        {item.status ? item.status.toLowerCase() : 'unpaid'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {item.status !== 'PAID' && balanceFor(item) != null && balanceFor(item) > 0 && (
                          <button className="approve-btn" onClick={() => openPayment(item)}>Record payment</button>
                        )}
                        <button className="btn btn-light" type="button" onClick={() => showPaymentHistory(item)}>History</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {invoiceError && <p role="alert" style={{ color: '#ff6b6b' }}>{invoiceError}</p>}
      {projectLoadError && <p role="alert">{projectLoadError}</p>}
      {paymentInvoice && (
        <div className="modal-backdrop" onClick={() => !paymentBusy && setPaymentInvoice(null)}>
          <form className="modal-card" onSubmit={submitPayment} onClick={e => e.stopPropagation()}>
            <div className="modal-head"><h2>Record Payment</h2><button type="button" className="icon-button" onClick={() => setPaymentInvoice(null)} disabled={paymentBusy}><X size={18}/></button></div>
            <p>Invoice: {paymentInvoice.invoiceNumber}</p>
            <p>Remaining balance: <strong>{fmt(balanceFor(paymentInvoice) ?? 0)}</strong></p>
            <label>Payment amount (INR)
              <input type="number" min="0.01" step="0.01" max={balanceFor(paymentInvoice) ?? undefined} required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
            </label>
            <label>Payment method
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Cheque</option>
              </select>
            </label>
            {paymentError && <p role="alert" style={{ color: '#ff6b6b' }}>{paymentError}</p>}
            <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setPaymentInvoice(null)} disabled={paymentBusy}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={paymentBusy}>{paymentBusy ? 'Saving...' : 'Save Payment'}</button></div>
          </form>
        </div>
      )}
      {historyInvoice && (
        <div className="modal-backdrop" onClick={() => setHistoryInvoice(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><h2>Payment History — {historyInvoice.invoiceNumber}</h2><button type="button" className="icon-button" onClick={() => setHistoryInvoice(null)}><X size={18}/></button></div>
            {historyLoading ? <p>Loading payments...</p> : paymentHistory.length === 0 ? <p>No payments recorded.</p> : (
              <div style={{ overflowX: 'auto' }}><table><thead><tr><th>DATE</th><th>METHOD</th><th>AMOUNT</th></tr></thead><tbody>
                {paymentHistory.map(p => p.error ? <tr key={p.id}><td colSpan="3">{p.error}</td></tr> : <tr key={p.id}><td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString('en-IN') : '—'}</td><td>{p.method}</td><td>{fmt(p.amountPaid)}</td></tr>)}
              </tbody></table></div>
            )}
            <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setHistoryInvoice(null)}>Close</button></div>
          </div>
        </div>
      )}
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
              <select required value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)}>
                <option value="">-- Select Vendor / Supplier --</option>
                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
              {vendorLoadError && <p role="alert">{vendorLoadError}</p>}
            </label>

            <label>
              Associated Production Project
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">-- Select production project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
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