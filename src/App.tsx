import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import BlogPage from "./pages/BlogPage";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Onboarding from "./pages/Onboarding";
import AmbassadorApply from "./pages/AmbassadorApply";
import AmbassadorPortal from "./pages/AmbassadorPortal";
import AmbassadorLanding from "./pages/AmbassadorLanding";
import VolunteerConsole from "./pages/VolunteerConsole";
import SuperAdmin from "./pages/SuperAdmin";
import LearnOnlineAuth from "./pages/LearnOnlineAuth";
import LearnOnlinePayment from "./pages/LearnOnlinePayment";
import LearnOnlineSuccess from "./pages/LearnOnlineSuccess";
import ManualReceipt from "./pages/ManualReceipt";
import ClaimReceipt from "./pages/ClaimReceipt";
import Accounting from "./pages/Accounting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/ambassador" element={<AmbassadorLanding />} />
          <Route path="/ambassador-apply" element={<AmbassadorApply />} />
          <Route path="/ambassador-portal" element={<AmbassadorPortal />} />
          <Route path="/volunteer" element={<VolunteerConsole />} />
          <Route path="/learn-online/auth" element={<LearnOnlineAuth />} />
          <Route path="/learn-online/payment" element={<LearnOnlinePayment />} />
          <Route path="/learn-online/success" element={<LearnOnlineSuccess />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/super" element={<SuperAdmin />} />
          <Route path="/receipt" element={<ManualReceipt />} />
          <Route path="/receipt/claim/:token" element={<ClaimReceipt />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
