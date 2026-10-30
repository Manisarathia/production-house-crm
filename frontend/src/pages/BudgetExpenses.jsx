import { useState, useEffect } from 'react';
import { Plus, Search, Wallet, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/finance/budgets';

const money = n => '₹' + Number(n).toLocaleString('en-IN');

export default function BudgetExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [q, setQ] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const [totalAllocated, setTotalAllocated] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);

    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('proj-uuid-101');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Production');
    const [loggedBy, setLoggedBy] = useState('Production Manager');

    const fetchExpenses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Network issue retrieving global expense logs matrix:", error);
        }
    };

    const fetchBudgetDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/project/${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setTotalAllocated(Number(data.totalAllocated));
                setTotalSpent(Number(data.totalSpent));
            }
        } catch (error) {
            console.error("Network issue retrieving project budget boundaries profile:", error);
        }
    };

    useEffect(() => {
        const syncDataGrid = async () => {
            setLoading(true);
            await Promise.all([fetchExpenses(), fetchBudgetDetails()]);
            setLoading(false);
        };
        syncDataGrid();
    }, [projectId]);

    async function submitExpense(e) {
        e.preventDefault();

        const payload = {
            amount: parseFloat(amount),
            category: category,
            loggedBy: loggedBy,
            expenseDate: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            description: title,
            project: {
                id: projectId
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await fetchExpenses();
                setShow(false);
                setTitle('');
                setAmount('');
            } else {
                alert("Failed to submit expense record to backend service layer endpoints.");
            }
        } catch (error) {
            console.error("Failure submitting expense payload data grid:", error);
        }
    }

    async function changeExpenseStatus(expenseId, statusValue) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/status?status=${statusValue}`, {
                method: 'PATCH'
            });

            if (response.ok) {
                await Promise.all([fetchExpenses(), fetchBudgetDetails()]);
            } else {
                alert("Status transaction execution failed.");
            }
        } catch (error) {
            console.error("Failure updating target expense verification trace status:", error);
        }
    }

    const filtered = expenses.filter(r =>
        ((r.description || '') + (r.project?.title || '') + (r.project?.id || '') + (r.category || '') + (r.status || ''))
            .toLowerCase().includes(q.toLowerCase())
    );

    const pendingRequests = expenses.filter(r => r.status === 'PENDING');
    const pendingTotalAmount = pendingRequests.reduce((a, r) => a + Number(r.amount), 0);
    const utilizationRate = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : '0.0';

    return (
        <>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">FINANCE & RESOURCES</div>
                    <h1>Budget & Expenses</h1>
                    <p>Monitor production budgets, track spend and review expense requests.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={18} /> Add expense</button>
            </div>

            <section className="stats-grid finance-stats">
                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon blue"><Wallet size={19} /></div>
                        <span className="stat-change up">On track</span>
                    </div>
                    <p className="stat-title">Total approved budget</p>
                    <div className="stat-bottom">
                        <div><strong>{money(totalAllocated)}</strong><span>Across active productions</span></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon violet"><Wallet size={19} /></div>
                        <span className="stat-change up">{utilizationRate}%</span>
                    </div>
                    <p className="stat-title">Budget utilized</p>
                    <div className="stat-bottom">
                        <div><strong>{money(totalSpent)}</strong><span>Of {money(totalAllocated)} allocated</span></div>
                    </div>
                    <div className="progress-track wide-progress">
                        <div className="progress-fill blue" style={{ width: `${Math.min(parseFloat(utilizationRate), 100)}%` }} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-icon orange"><Wallet size={19} /></div>
                        <span className="stat-change down">Needs review</span>
                    </div>
                    <p className="stat-title">Pending expenses</p>
                    <div className="stat-bottom">
                        <div>
                            <strong>{money(pendingTotalAmount)}</strong>
                            <span>{pendingRequests.length} requests awaiting approval</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="panel page-panel">
                <div className="panel-head">
                    <div><h2>Expense tracker</h2><p>Review and manage submitted expense requests.</p></div>
                    <label className="table-search">
                        <Search size={16} />
                        <input placeholder="Search expenses..." value={q} onChange={e => setQ(e.target.value)} />
                    </label>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>PROJECT NAME</th>
                                <th>EXPENSE DETAILS</th>
                                <th>CATEGORY</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>Synchronizing ledger state balances...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No expenditure entries matching evaluation trace metrics.</td></tr>
                            ) : (
                                filtered.map((r, idx) => (
                                    <tr key={r.id || idx}>

                                        <td>
                                            <strong style={{ color: '#f4f0eb', fontSize: '12px' }}>
                                                {r.project && r.project.title ? r.project.title : 'General Project'}
                                            </strong>
                                        </td>
                                        <td>
                                            <div className="expense-title">
                                                <strong>{r.description || 'General Expense Line'}</strong>
                                                <span style={{ fontSize: '9px', color: '#aaa39d', marginTop: '4px', display: 'block' }}>
                                                    Date logged: {r.expenseDate}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{r.category}</td>
                                        <td><strong>{money(r.amount)}</strong></td>
                                        <td>
                                            <span className={`status-pill ${r.status === 'APPROVED' ? 'green' : 'orange'}`}>{r.status}</span>
                                        </td>
                                        <td>
                                            {r.status === 'PENDING' ? (
                                                <div className="row-actions">
                                                    <button type="button" className="approve-btn" onClick={() => changeExpenseStatus(r.id, 'APPROVED')}>Approve</button>
                                                    <button type="button" className="reject-btn" onClick={() => changeExpenseStatus(r.id, 'REJECTED')}>Reject</button>
                                                </div>
                                            ) : <span className="muted">— Closed Track</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {show && (
                <div className="modal-backdrop" onClick={() => setShow(false)}>
                    <form className="modal-card" onSubmit={submitExpense} onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <div><h2>Add expense</h2><p>Submit a new production expense for review.</p></div>
                            <button type="button" className="icon-button" onClick={() => setShow(false)}><X size={18} /></button>
                        </div>

                        <label>
                            Expense description
                            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Location rental" />
                        </label>

                        <label>
                            Project Context Selection Key
                            <select value={projectId} onChange={e => setProjectId(e.target.value)}>
                                <option value="proj-uuid-101">The Last Monsoon (ID: 101)</option>
                                <option value="proj-uuid-102">City of Echoes (ID: 102)</option>
                                <option value="proj-uuid-103">Beyond The Frame (ID: 103)</option>
                            </select>
                        </label>

                        <label>
                            Category
                            <select value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Production">Production</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Travel">Travel</option>
                                <option value="Operations">Operations</option>
                                <option value="Post-production">Post-production</option>
                            </select>
                        </label>

                        <label>
                            Amount (INR)
                            <input type="number" min="1" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="25000" />
                        </label>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-light" onClick={() => setShow(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary"><Plus size={16} /> Submit expense</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
