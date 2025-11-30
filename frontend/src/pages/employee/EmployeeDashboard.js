import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getEmployeeDashboard,
  clearError as clearDashboardError,
} from '../../store/slices/dashboardSlice';
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  clearError as clearAttendanceError,
} from '../../store/slices/attendanceSlice';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employeeDashboard, isLoading } = useSelector((state) => state.dashboard);
  const { todayAttendance, isLoading: attendanceLoading } = useSelector(
    (state) => state.attendance
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEmployeeDashboard());
    dispatch(getTodayAttendance());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      toast.success('Checked in successfully!');
      dispatch(getTodayAttendance());
      dispatch(getEmployeeDashboard());
    } catch (error) {
      toast.error(error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await dispatch(checkOut()).unwrap();
      toast.success('Checked out successfully!');
      dispatch(getTodayAttendance());
      dispatch(getEmployeeDashboard());
    } catch (error) {
      toast.error(error || 'Check-out failed');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: <span className="badge badge-success">Present</span>,
      absent: <span className="badge badge-danger">Absent</span>,
      late: <span className="badge badge-warning">Late</span>,
      'half-day': <span className="badge badge-info">Half Day</span>,
    };
    return badges[status] || null;
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!employeeDashboard) {
    return null;
  }

  const { today, monthly, recent7Days } = employeeDashboard;

  return (
    <div className="container">
      <h1>Welcome, {user?.name}!</h1>
      <p className="mb-4">Employee ID: {user?.employeeId}</p>

      {/* Today's Status Card */}
      <div className="card today-status-card">
        <h2>Today's Status</h2>
        <div className="today-status-content">
          <div className="status-info">
            {today.status ? (
              <div>
                {getStatusBadge(today.status)}
                {today.checkInTime && (
                  <p className="mt-4">
                    <strong>Check In:</strong>{' '}
                    {new Date(today.checkInTime).toLocaleTimeString()}
                  </p>
                )}
                {today.checkOutTime && (
                  <p>
                    <strong>Check Out:</strong>{' '}
                    {new Date(today.checkOutTime).toLocaleTimeString()}
                  </p>
                )}
                {today.totalHours > 0 && (
                  <p>
                    <strong>Total Hours:</strong> {today.totalHours} hours
                  </p>
                )}
              </div>
            ) : (
              <p className="text-danger">Not checked in yet</p>
            )}
          </div>
          <div className="quick-actions">
            {!today.checkedIn && (
              <button
                onClick={handleCheckIn}
                className="btn btn-success btn-large"
                disabled={attendanceLoading}
              >
                Check In
              </button>
            )}
            {today.checkedIn && !today.checkedOut && (
              <button
                onClick={handleCheckOut}
                className="btn btn-danger btn-large"
                disabled={attendanceLoading}
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-4">
        <div className="card stat-card">
          <h3>Present</h3>
          <p className="stat-value text-success">{monthly.present}</p>
        </div>
        <div className="card stat-card">
          <h3>Absent</h3>
          <p className="stat-value text-danger">{monthly.absent}</p>
        </div>
        <div className="card stat-card">
          <h3>Late</h3>
          <p className="stat-value text-warning">{monthly.late}</p>
        </div>
        <div className="card stat-card">
          <h3>Half Day</h3>
          <p className="stat-value text-primary">{monthly.halfDay}</p>
        </div>
      </div>

      {/* Total Hours */}
      <div className="card">
        <h2>Monthly Summary</h2>
        <p className="stat-value-large text-primary">
          {monthly.totalHours.toFixed(2)} hours
        </p>
        <p className="text-center">Total hours worked this month</p>
      </div>

      {/* Recent 7 Days */}
      <div className="card">
        <h2>Recent 7 Days</h2>
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {recent7Days.length > 0 ? (
                recent7Days.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>
                      {record.checkInTime
                        ? new Date(record.checkInTime).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>{record.totalHours || 0} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


