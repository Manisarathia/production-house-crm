import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Clapperboard, LayoutDashboard, Users, Building2, Settings, Truck, Wallet, Receipt, Bell, Search, Menu, X, ChevronDown } from 'lucide-react';

const groups = [
 { label: 'WORKSPACE', items: [{to:'/',label:'Dashboard',Icon:LayoutDashboard},{to:'/team',label:'Team & User Roles',Icon:Users},{to:'/departments',label:'Departments',Icon:Building2}] },
 { label: 'FINANCE & RESOURCES', items: [{to:'/vendors-equipment',label:'Vendors & Equipment',Icon:Truck},{to:'/budget-expenses',label:'Budget & Expenses',Icon:Wallet},{to:'/invoices-payments',label:'Invoices & Payments',Icon:Receipt}] },
 { label: 'PREFERENCES', items: [{to:'/settings',label:'Settings',Icon:Settings}] }
];
const titles = {'/':'Overview','/team':'Team & User Roles','/departments':'Departments','/settings':'Settings','/vendors-equipment':'Vendors & Equipment','/budget-expenses':'Budget & Expenses','/invoices-payments':'Invoices & Payments'};
export default function MainLayout(){
 const [open,setOpen]=useState(false); const loc=useLocation(); const navigate=useNavigate();
 const logout=()=>{localStorage.removeItem('loopstream-auth');localStorage.removeItem('loopstream-user');navigate('/login',{replace:true});};
 return <div className="app-shell">
  {open && <button className="mobile-overlay" aria-label="Close navigation" onClick={()=>setOpen(false)} />}
  <aside className={`sidebar ${open?'sidebar-open':''}`}>
   <div className="brand">
    <div className="brand-mark"><Clapperboard size={23}/></div>
    <div><strong>LOOPSTREAM</strong><span>PRODUCTION CRM</span></div>
    <button className="mobile-close" onClick={()=>setOpen(false)}><X size={20}/></button></div>
   {/* <div className="workspace-switch"><div className="workspace-icon">FF</div><div className="workspace-copy"><strong>Studio North</strong><span>Production workspace</span></div><ChevronDown size={16}/></div> */}
   <nav className="nav-list">{groups.map(g=><div className="nav-group" key={g.label}><p className="nav-label">{g.label}</p>{g.items.map(({to,label,Icon})=><NavLink end={to==='/'} to={to} key={to} onClick={()=>setOpen(false)} className={({isActive})=>`nav-item ${isActive?'active':''}`}><Icon size={18}/><span>{label}</span>{label==='Team & User Roles'&&<span className=""></span>}</NavLink>)}</div>)}</nav>
   <div className="sidebar-bottom">
    <div className="help-card">
        <div className="help-dot">?</div>
        <strong>Need a hand?</strong>
        <p>Visit the help center for quick guides.</p>
        <button onClick={()=>alert('Help center coming soon.')}>Open help center ↗</button></div>
        <div className="user-mini">
            <div className="avatar avatar-blue">JM</div>
            <div className="user-meta">
                <strong>Jaison M</strong><span>Administrator</span></div>
                <button className="logout-button" onClick={logout} title="Sign out">Sign out</button></div></div>
  </aside>
  <main className="main-area">
    <header className="topbar">
        <button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={22}/></button>
        <div className="breadcrumb">Studio North <span>/</span> <strong>{titles[loc.pathname]||'Overview'}</strong></div>
        <div className="top-actions"><label className="global-search"><Search size={17}/><input placeholder="Search anything..."/><kbd>⌘ K</kbd></label><button className="icon-button notification" aria-label="Notifications" onClick={()=>alert('You are all caught up!')}><Bell size={19}/><i/></button><div className="top-avatar">JM</div></div></header><div className="page-content"><Outlet/></div><footer className="footer"><span>© 2026 FrameFlow CRM</span><span>Made for teams that make stories.</span></footer></main>
 </div>;
}