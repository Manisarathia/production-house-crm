import { useState } from 'react';
import { Plus, Search, ReceiptText, X, Download } from 'lucide-react';

const initial = [
  { id: 'INV-2026-041', vendor: 'CineGear Rentals', project: 'The Last Monsoon', amount: 185000, due: 'Nov 02, 2026', status: 'Due' },
  { id: 'INV-2026-040', vendor: 'Lightbox Studios', project: 'City of Echoes', amount: 92000, due: 'Oct 30, 2026', status: 'Pending' },
  { id: 'INV-2026-039', vendor: 'SoundWave Pro', project: 'Beyond The Frame', amount: 67500, due: 'Oct 20, 2026', status: 'Paid' },
  { id: 'INV-2026-038', vendor: 'Metro Transport', project: 'The Last Monsoon', amount: 34000, due: 'Oct 18, 2026', status: 'Overdue' },
];
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function InvoicesPayments() {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [project, setProject] = useState('The Last Monsoon');

  function add(e) {
    e.preventDefault();
    const nextNumber = 42 + items.length - initial.length;
    setItems([{ id: `INV-2026-${String(nextNumber).padStart(3, '0')}`, vendor, project, amount: Number(amount), due: 'Nov 15, 2026', status: 'Pending' }, ...items]);
    setShow(false);
    setVendor('');
    setAmount('');
  }

  function markPaid(id) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: 'Paid' } : item));
  }

  function exportCsv() {
    const rows = [
      ['Invoice', 'Vendor', 'Project', 'Amount', 'Due date', 'Status'],
      ...items.map((item) => [item.id, item.vendor, item.project, item.amount, item.due, item.status]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const list = items.filter((item) => `${item.id}${item.vendor}${item.project}${item.status}`.toLowerCase().includes(q.toLowerCase()));
  const pending = items.filter((item) => item.status !== 'Paid').reduce((total, item) => total + item.amount, 0);

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">FINANCE &amp; RESOURCES</div><h1>Invoices &amp; Payments</h1><p>Generate invoices, monitor payment status and keep vendors paid on time.</p></div>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={18} /> Create invoice</button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat"><span>Total invoices</span><strong>{items.length + 38}</strong></div>
        <div className="mini-stat"><span>Outstanding balance</span><strong>{fmt(pending)}</strong></div>
        <div className="mini-stat"><span>Paid this month</span><strong>₹12.4L</strong></div>
        <div className="mini-stat"><span>Overdue invoices</span><strong>{items.filter((item) => item.status === 'Overdue').length}</strong></div>
      </div>

      <div className="panel page-panel">
        <div className="panel-head">
          <div><h2>Invoice register</h2><p>All vendor invoices and their current payment status.</p></div>
          <div className="inline-actions">
            <label className="table-search"><Search size={16} /><input placeholder="Search invoices..." value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <button className="btn btn-light" onClick={exportCsv}><Download size={16} /> Export</button>
          </div>
        </div>
        <div className="table-wrap"><table><thead><tr><th>INVOICE ID</th><th>VENDOR</th><th>PROJECT</th><th>AMOUNT</th><th>DUE DATE</th><th>STATUS</th><th>ACTION</th></tr></thead>
          <tbody>{list.map((item) => <tr key={item.id}>
            <td><strong className="invoice-id">{item.id}</strong></td><td>{item.vendor}</td><td>{item.project}</td><td><strong>{fmt(item.amount)}</strong></td><td>{item.due}</td>
            <td><span className={`status-pill ${item.status === 'Paid' ? 'green' : item.status === 'Overdue' ? 'red' : 'orange'}`}>{item.status}</span></td>
            <td>{item.status !== 'Paid' ? <button className="approve-btn" onClick={() => markPaid(item.id)}>Mark paid</button> : <span className="muted">Completed</span>}</td>
          </tr>)}</tbody>
        </table></div>
      </div>

      {show && <div className="modal-backdrop" onClick={() => setShow(false)}>
        <form className="modal-card" onSubmit={add} onClick={(e) => e.stopPropagation()}>
          <div className="modal-head"><div><h2>Create invoice</h2><p>Register a vendor invoice for tracking.</p></div><button type="button" className="icon-button" onClick={() => setShow(false)}><X size={18} /></button></div>
          <label>Vendor name<input required value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor or supplier" /></label>
          <label>Project<select value={project} onChange={(e) => setProject(e.target.value)}><option>The Last Monsoon</option><option>City of Echoes</option><option>Beyond The Frame</option></select></label>
          <label>Invoice amount (INR)<input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" /></label>
          <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary"><ReceiptText size={16} /> Create invoice</button></div>
        </form>
      </div>}
    </>
  );
}
