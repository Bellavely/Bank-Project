import { Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/auth/authPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import SendMoney from "./pages/sendMoney/SendMoney";
import { Login } from "./components/loginComponent";
import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute";
import AppLayout from "./components/appLayout/AppLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Dashboard />} />
      <Route path="send" element={<SendMoney />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <>
      <AppRoutes />
    </>
  );
};
