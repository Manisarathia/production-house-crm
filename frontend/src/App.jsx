import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectsProductions from './pages/ProjectsProductions.jsx';
import MoviesWebSeries from './pages/MoviesWebSeries.jsx';
import CastCrewManagement from './pages/CastCrewManagement.jsx';
import EpisodesScenes from './pages/EpisodesScenes.jsx';
import TeamUsers from './pages/TeamUsers.jsx';
import Departments from './pages/Departments.jsx';
import Settings from './pages/Settings.jsx';
import VendorsEquipment from './pages/VendorsEquipment.jsx';
import BudgetExpenses from './pages/BudgetExpenses.jsx';
import InvoicesPayments from './pages/InvoicesPayments.jsx';
import './app.css';

function ProtectedLayout() {
  const [authenticated] = useState(() => localStorage.getItem('frameflow-auth') === 'true');
  if (!authenticated) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsProductions />} />
        <Route path="/movies-series" element={<MoviesWebSeries />} />
        <Route path="/cast-crew" element={<CastCrewManagement />} />
        <Route path="/episodes-scenes" element={<EpisodesScenes />} />
        <Route path="/team" element={<TeamUsers />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/vendors-equipment" element={<VendorsEquipment />} />
        <Route path="/budget-expenses" element={<BudgetExpenses />} />
        <Route path="/invoices-payments" element={<InvoicesPayments />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
