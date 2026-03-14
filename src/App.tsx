import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AITransparencyPage from "./pages/AITransparencyPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import SharedResourcesPage from "./pages/SharedResourcesPage";
import RiskScorePage from "./pages/RiskScorePage";
import ConsentSetupPage from "./pages/ConsentSetupPage";
import UserConsentsPage from "./pages/UserConsentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/shared-resources" element={<ProtectedRoute><SharedResourcesPage /></ProtectedRoute>} />
            <Route path="/ai-transparency" element={<ProtectedRoute><AITransparencyPage /></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute><ActivityLogPage /></ProtectedRoute>} />
            <Route path="/risk-score" element={<ProtectedRoute><RiskScorePage /></ProtectedRoute>} />
            <Route path="/user-consents" element={<ProtectedRoute><UserConsentsPage /></ProtectedRoute>} />
            <Route path="/consent-setup" element={<ProtectedRoute><ConsentSetupPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
