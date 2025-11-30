import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import Profile from './pages/Profile';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamAttendance from './pages/manager/TeamAttendance';
import Reports from './pages/manager/Reports';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              {user?.role === 'manager' ? (
                <ManagerDashboard />
              ) : (
                <EmployeeDashboard />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <PrivateRoute requiredRole="employee">
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <PrivateRoute requiredRole="employee">
              <MyAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute requiredRole="manager">
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/attendance"
          element={
            <PrivateRoute requiredRole="manager">
              <TeamAttendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <PrivateRoute requiredRole="manager">
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

