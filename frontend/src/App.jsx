
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TestInterface from './components/TestInterface';
import TestReport from './components/TestReport';
import AdminPanel from './components/AdminPanel';
import Leaderboard from './components/Leaderboard';
import StudentManagement from './components/StudentManagement';
import AdminTestReport from './components/AdminTestReport';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } />
            <Route path="/test/:id" element={
              <ProtectedRoute>
                <TestInterface />
              </ProtectedRoute>
            } />
            <Route path="/report/:testId" element={
              <ProtectedRoute>
                <TestReport />
              </ProtectedRoute>
            } />
            <Route path="/test-report/:testId" element={
              <ProtectedRoute>
                  <TestReport />
              </ProtectedRoute>
              } />

              <Route path="/student-test-report/:performanceId" element={
              <ProtectedRoute>
                  <AdminTestReport/>
              </ProtectedRoute>
              } />

            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
              } />
            <Route path="/leaderboard/:testId" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;