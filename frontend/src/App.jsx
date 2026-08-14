import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./pages/Chatbot";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";
import SalesEntry from "./pages/SalesEntry";

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-ghost">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 pt-16 md:pt-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ghost px-4">
      <div className="max-w-md border border-fog bg-white p-8 text-center">
        <h1 className="font-quicksand text-3xl font-bold text-ink">404</h1>
        <p className="mt-2 text-sm font-quicksand text-ash">This page does not exist.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedPage>
            <Products />
          </ProtectedPage>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedPage>
            <SalesEntry />
          </ProtectedPage>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedPage>
            <Expenses />
          </ProtectedPage>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedPage>
            <Reports />
          </ProtectedPage>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedPage>
            <Documents />
          </ProtectedPage>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedPage>
            <Reminders />
          </ProtectedPage>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedPage>
            <Chatbot />
          </ProtectedPage>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
