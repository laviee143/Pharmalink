import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard
import Dashboard from './pages/Dashboard/Dashboard';

// Medicine Management
import MedicinesList from './pages/Medicines/MedicinesList';
import AddMedicine from './pages/Medicines/AddMedicine';
import EditMedicine from './pages/Medicines/EditMedicine';

// Customer Management
import CustomersList from './pages/Customers/CustomersList';
import AddCustomer from './pages/Customers/AddCustomer';
import EditCustomer from './pages/Customers/EditCustomer';

// Prescription Management
import PrescriptionsList from './pages/Prescriptions/PrescriptionsList';
import AddPrescription from './pages/Prescriptions/AddPrescription';
import ViewPrescription from './pages/Prescriptions/ViewPrescription';

// Invoice Management
import InvoicesList from './pages/Invoices/InvoicesList';
import AddInvoice from './pages/Invoices/AddInvoice';
import ViewInvoice from './pages/Invoices/ViewInvoice';

// User Management
import Profile from './pages/Users/Profile';
import UsersList from './pages/Users/UsersList';

// Reports
import Reports from './pages/Reports/Reports';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Medicine Routes */}
              <Route path="medicines">
                <Route index element={<MedicinesList />} />
                <Route path="add" element={<AddMedicine />} />
                <Route path="edit/:id" element={<EditMedicine />} />
              </Route>

              {/* Customer Routes */}
              <Route path="customers">
                <Route index element={<CustomersList />} />
                <Route path="add" element={<AddCustomer />} />
                <Route path="edit/:id" element={<EditCustomer />} />
              </Route>

              {/* Prescription Routes */}
              <Route path="prescriptions">
                <Route index element={<PrescriptionsList />} />
                <Route path="add" element={<AddPrescription />} />
                <Route path="view/:id" element={<ViewPrescription />} />
              </Route>

              {/* Invoice Routes */}
              <Route path="invoices">
                <Route index element={<InvoicesList />} />
                <Route path="add" element={<AddInvoice />} />
                <Route path="view/:id" element={<ViewInvoice />} />
              </Route>

              {/* User Routes */}
              <Route path="users">
                <Route index element={<UsersList />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Reports */}
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
