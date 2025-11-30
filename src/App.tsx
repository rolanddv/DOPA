import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Articles from "./pages/Articles";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import BadgeGallery from "./pages/BadgeGallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, hasOnboarded, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, hasOnboarded, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : !hasOnboarded ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <Navigate to="/feed" replace />
          )
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <Articles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route
        path="/onboarding"
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : hasOnboarded ? (
            <Navigate to="/feed" replace />
          ) : (
            <Onboarding />
          )
        }
      />
      <Route
        path="/badges"
        element={
          <ProtectedRoute>
            <BadgeGallery />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster />
            <Sonner />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
