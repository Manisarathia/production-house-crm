import { useState } from 'react'; import { Plus, Search, Wallet, X } from 'lucide-react';
const seed=[{title:'Camera equipment rental',project:'The Last Monsoon',category:'Equipment',amount:185000,status:'Approved',date:'Oct 25, 2026'},{title:'Location scouting travel',project:'City of Echoes',category:'Travel',amount:42000,status:'Pending',date:'Oct 24, 2026'},{title:'Set construction materials',project:'Beyond The Frame',category:'Production',amount:96000,status:'Approved',date:'Oct 22, 2026'},{title:'Crew catering',project:'The Last Monsoon',category:'Operations',amount:28500,status:'Pending',date:'Oct 21, 2026'}]; const money=n=>'₹'+n.toLocaleString('en-IN');
export default function BudgetExpenses()
{const [rows,setRows]=useState(seed),
    [q,setQ]=useState(''),
    [show,setShow]=useState(false),
    [title,setTitle]=useState(''),
    [project,setProject]=useState('The Last Monsoon'),
    [amount,setAmount]=useState(''),
    [category,setCategory]=useState('Production');
    
    function add(e){e.preventDefault();setRows([{title,project,category,amount:Number(amount),status:'Pending',date:'Oct 29, 2026'},...rows]);
    setShow(false);setTitle('');
    setAmount('')};
    
    function change(i,status){setRows(rows.map((r,idx)=>idx===i?{...r,status}:r))};
    const filtered=rows.filter(r=>(r.title+r.project+r.category+r.status).toLowerCase().includes(q.toLowerCase()));
    
    
    return <>
    <div className="page-heading">
        <div><div className="eyebrow">FINANCE & RESOURCES</div>
        <h1>Budget & Expenses</h1>
        <p>Monitor production budgets, track spend and review expense requests.</p></div>
        <button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={18}/> Add expense</button></div>
        <section className="stats-grid finance-stats">
            <div className="stat-card">
                <div className="stat-top">
                    <div className="stat-icon blue"><Wallet size={19}/></div><span className="stat-change up">On track</span></div>
                    <p className="stat-title">Total approved budget</p>
                    <div className="stat-bottom">
                        <div><strong>₹84.6L</strong><span>Across 18 productions</span></div></div></div>
                        <div className="stat-card"><div className="stat-top">
                            <div className="stat-icon violet"><Wallet size={19}/></div><span className="stat-change up">68.4%</span></div>
                            <p className="stat-title">Budget utilized</p>
                            <div className="stat-bottom">
                                <div><strong>₹57.8L</strong><span>Of ₹84.6L allocated</span></div></div>
                                <div className="progress-track wide-progress">
                                    <div className="progress-fill blue" style={{width:'68.4%'}}/></div></div>
                                    <div className="stat-card"><div className="stat-top">
                                        <div className="stat-icon orange"><Wallet size={19}/></div><span className="stat-change down">Needs review</span></div>
                                        <p className="stat-title">Pending expenses</p>
                                        <div className="stat-bottom"><div><strong>{money(rows.filter(r=>r.status==='Pending').reduce((a,r)=>a+r.amount,0))}</strong><span>{rows.filter(r=>r.status==='Pending').length} requests awaiting approval</span></div></div></div></section>
                                        <div className="panel page-panel">
                                            
                                            <div className="panel-head">
                                                <div><h2>Expense tracker</h2><p>Review and manage submitted expense requests.</p></div><label className="table-search"><Search size={16}/><input placeholder="Search expenses..." value={q} onChange={e=>setQ(e.target.value)}/></label></div>
                                                <div className="table-wrap">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>EXPENSE</th>
                                                                <th>PROJECT</th>
                                                                <th>CATEGORY</th>
                                                                <th>AMOUNT</th>
                                                                <th>STATUS</th>
                                                                <th>ACTION</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>{filtered.map((r,i)=><tr key={r.title+i}><td>
                                                                    <div className="expense-title"><strong>{r.title}</strong><span>{r.date}</span></div></td><td>{r.project}</td><td>{r.category}</td><td><strong>{money(r.amount)}</strong></td><td><span className={`status-pill ${r.status==='Approved'?'green':'orange'}`}>{r.status}</span></td><td>{r.status==='Pending'?<div className="row-actions"><button className="approve-btn" onClick={()=>change(rows.indexOf(r),'Approved')}>Approve</button>
                                                                    <button className="reject-btn" onClick={()=>change(rows.indexOf(r),'Rejected')}>Reject</button></div>:<span className="muted">—</span>}</td></tr>)}</tbody></table></div></div>{show&&<div className="modal-backdrop" onClick={()=>setShow(false)}>
                                                                        <form className="modal-card" onSubmit={add} onClick={e=>e.stopPropagation()}>
                                                                            <div className="modal-head"><div>
                                                                                <h2>Add expense</h2><p>Submit a new production expense for review.</p></div><button type="button" className="icon-button" onClick={()=>setShow(false)}><X size={18}/></button></div><label>Expense description<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Location rental"/></label><label>Project<select value={project} onChange={e=>setProject(e.target.value)}><option>The Last Monsoon</option><option>City of Echoes</option><option>Beyond The Frame</option></select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Production</option><option>Equipment</option><option>Travel</option><option>Operations</option><option>Post-production</option></select></label><label>Amount (INR)<input type="number" min="1" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="25000"/></label><div className="modal-actions"><button type="button" className="btn btn-light" onClick={()=>setShow(false)}>Cancel</button><button className="btn btn-primary"><Plus size={16}/> Submit expense</button></div></form></div>}</>}
