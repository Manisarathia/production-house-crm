import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import TeamUsers from './pages/TeamUsers';
import Departments from './pages/Departments';
import Settings from './pages/Settings';

import ProjectsProductions from './pages/ProjectsProductions';
import MoviesWebSeries from './pages/MoviesWebSeries';
import CastCrewManagement from './pages/CastCrewManagement';
import EpisodesScenes from './pages/EpisodesScenes';

import VendorsEquipment from './pages/VendorsEquipment';
import BudgetExpenses from './pages/BudgetExpenses';
import InvoicesPayments from './pages/InvoicesPayments';

import SchedulePage from './pages/SchedulePage';
import TasksPage from './pages/TaskPage';
import AttendancePage from './pages/Attendance';
import CallSheetsPage from './pages/CallSheet';
import LocationsPage from './pages/Location';
import DeliveryPage from './pages/DeliveryPage';
import ApprovalsPage from './pages/ApprovalsPage';
import OttPage from './pages/OttPage';

import ReportsPage from './pages/ReportPages';
import NotificationsPage from './pages/Notification';

import './App.css';

function ProtectedLayout() {
  const isAuthenticated = localStorage.getItem('frameflow-auth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/team" element={<TeamUsers />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/projects" element={<ProjectsProductions />} />
        <Route path="/movies-series" element={<MoviesWebSeries />} />
        <Route path="/cast-crew" element={<CastCrewManagement />} />
        <Route path="/episodes-scenes" element={<EpisodesScenes />} />

        <Route path="/vendors-equipment" element={<VendorsEquipment />} />
        <Route path="/budget-expenses" element={<BudgetExpenses />} />
        <Route path="/invoices-payments" element={<InvoicesPayments />} />

        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/call-sheets" element={<CallSheetsPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/ott-publishing" element={<OttPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
