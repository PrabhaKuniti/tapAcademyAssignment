import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getManagerDashboard,
  clearError,
} from '../../store/slices/dashboardSlice';
import './ManagerDashboard.css';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { managerDashboard, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getManagerDashboard());
  }, [dispatch]);

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!managerDashboard) {
    return null;
  }

  const {
    totalEmployees,
    today,
    lateArrivals,
    absentEmployees,
    weeklyTrend,
    departmentWise,
  } = managerDashboard;

  // Prepare department chart data
  const departmentData = Object.entries(departmentWise || {}).map(
    ([department, stats]) => ({
      name: department,
      value: stats.present || 0,
    })
  );

  return (
    <div className="container">
      <h1>Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-4">
        <div className="card stat-card">
          <h3>Total Employees</h3>
          <p className="stat-value text-primary">{totalEmployees}</p>
        </div>
        <div className="card stat-card">
          <h3>Present Today</h3>
          <p className="stat-value text-success">{today.present}</p>
        </div>
        <div className="card stat-card">
          <h3>Absent Today</h3>
          <p className="stat-value text-danger">{today.absent}</p>
        </div>
        <div className="card stat-card">
          <h3>Late Arrivals</h3>
          <p className="stat-value text-warning">{today.late}</p>
        </div>
      </div>

      {/* Today's Insights */}
      <div className="grid grid-2">
        {/* Late Arrivals */}
        <div className="card">
          <h2>Late Arrivals Today</h2>
          {lateArrivals && lateArrivals.length > 0 ? (
            <div className="list-container">
              {lateArrivals.map((arrival, index) => (
                <div key={index} className="list-item">
                  <div>
                    <strong>{arrival.name}</strong>
                    <span className="list-meta">
                      {arrival.employeeId} • {arrival.department}
                    </span>
                  </div>
                  <div className="text-warning">
                    {new Date(arrival.checkInTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No late arrivals today!</p>
          )}
        </div>

        {/* Absent Employees */}
        <div className="card">
          <h2>Absent Employees Today</h2>
          {absentEmployees && absentEmployees.length > 0 ? (
            <div className="list-container">
              {absentEmployees.map((employee, index) => (
                <div key={index} className="list-item">
                  <div>
                    <strong>{employee.name}</strong>
                    <span className="list-meta">
                      {employee.employeeId} • {employee.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">All employees present!</p>
          )}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card">
        <h2>Weekly Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department-wise Chart */}
      {departmentData.length > 0 && (
        <div className="card">
          <h2>Department-wise Attendance (This Month)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;


