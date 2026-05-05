import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import SendMoney from "./pages/sendMoney/TransferPage";
import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute";
import AppLayout from "./components/appLayout/AppLayout";
import { AuthProvider } from "./hooks/authContext";
import { AuthPage } from "./pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="send" element={<SendMoney />} />
      </Route>
    </Routes>
  );
};

const queryClient = new QueryClient();

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
};
