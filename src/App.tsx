import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EquipmentListPage from "./pages/EquipmentListPage";
import EquipmentDetailsPage from "./pages/EquipmentDetailsPage";
import EquipmentCreatePage from "./pages/EquipmentCreatePage";
import LabsPage from "./pages/LabsPage";
import LabDetailsPage from "./pages/LabDetailsPage";
import VerificationListPage from "./pages/VerificationListPage";
import VerificationScanPage from "./pages/VerificationScanPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              <Route path="/equipment" element={<EquipmentListPage />} />
              <Route path="/equipment/create" element={<EquipmentCreatePage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailsPage />} />
              <Route path="/equipment/:id/edit" element={<EquipmentCreatePage />} />
              
              <Route path="/labs" element={<LabsPage />} />
              <Route path="/labs/:id" element={<LabDetailsPage />} />
              
              <Route path="/verification" element={<VerificationListPage />} />
              <Route path="/verification/scan" element={<VerificationScanPage />} />
              
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
