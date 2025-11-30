import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { exportAttendance, getAllAttendance } from '../../store/slices/attendanceSlice';
import apiClient from '../../config/api';
import { format } from 'date-fns';
import './Reports.css';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance, isLoading } = useSelector((state) => state.attendance);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      dispatch(getAllAttendance(filters));
    }
  }, [dispatch, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExport = async () => {
    if (!filters.startDate || !filters.endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    try {
      await dispatch(exportAttendance(filters)).unwrap();
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error(error || 'Export failed');
    }
  };

  const getSummaryStats = () => {
    if (allAttendance.length === 0) return null;

    const present = allAttendance.filter((a) => a.status === 'present').length;
    const absent = allAttendance.filter((a) => a.status === 'absent').length;
    const late = allAttendance.filter((a) => a.status === 'late').length;
    const halfDay = allAttendance.filter((a) => a.status === 'half-day').length;
    const totalHours = allAttendance.reduce(
      (sum, a) => sum + (a.totalHours || 0),
      0
    );

    return {
      total: allAttendance.length,
      present,
      absent,
      late,
      halfDay,
      totalHours,
    };
  };

  const summary = getSummaryStats();
  const getStatusBadge = (status) => {
    const badges = {
      present: <span className="badge badge-success">Present</span>,
      absent: <span className="badge badge-danger">Absent</span>,
      late: <span className="badge badge-warning">Late</span>,
      'half-day': <span className="badge badge-info">Half Day</span>,
    };
    return badges[status] || null;
  };

  return (
    <div className="container">
      <h1>Reports & Export</h1>

      {/* Filters */}
      <div className="card">
        <h2>Generate Report</h2>
        <div className="filter-grid">
          <div className="form-group">
            <label>Employee</label>
            <select
              name="employeeId"
              className="form-control"
              value={filters.employeeId}
              onChange={handleFilterChange}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
              required
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              setFilters({
                employeeId: '',
                startDate: '',
                endDate: '',
              })
            }
          >
            Clear Filters
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            Export to CSV
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="card">
          <h2>Summary Statistics</h2>
          <div className="grid grid-5">
            <div className="stat-card">
              <h3>Total Records</h3>
              <p className="stat-value text-primary">{summary.total}</p>
            </div>
            <div className="stat-card">
              <h3>Present</h3>
              <p className="stat-value text-success">{summary.present}</p>
            </div>
            <div className="stat-card">
              <h3>Absent</h3>
              <p className="stat-value text-danger">{summary.absent}</p>
            </div>
            <div className="stat-card">
              <h3>Late</h3>
              <p className="stat-value text-warning">{summary.late}</p>
            </div>
            <div className="stat-card">
              <h3>Half Day</h3>
              <p className="stat-value text-primary">{summary.halfDay}</p>
            </div>
          </div>
          <div className="stat-card summary-total">
            <h3>Total Hours Worked</h3>
            <p className="stat-value-large text-primary">
              {summary.totalHours.toFixed(2)} hours
            </p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {filters.startDate && filters.endDate && (
        <div className="card">
          <h2>
            Attendance Report (
            {filters.startDate && format(new Date(filters.startDate), 'MMM dd, yyyy')}{' '}
            to {filters.endDate && format(new Date(filters.endDate), 'MMM dd, yyyy')})
          </h2>
          {isLoading ? (
            <div className="loading">Loading attendance...</div>
          ) : (
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {allAttendance.length > 0 ? (
                    allAttendance.map((record, index) => (
                      <tr key={index}>
                        <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                        <td>{record.userId?.name}</td>
                        <td>{record.userId?.employeeId}</td>
                        <td>{record.userId?.department}</td>
                        <td>{record.userId?.email}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>
                          {record.checkInTime
                            ? format(new Date(record.checkInTime), 'hh:mm a')
                            : '-'}
                        </td>
                        <td>
                          {record.checkOutTime
                            ? format(new Date(record.checkOutTime), 'hh:mm a')
                            : '-'}
                        </td>
                        <td>{record.totalHours || 0} hrs</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No attendance records found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(!filters.startDate || !filters.endDate) && (
        <div className="card">
          <p className="text-center">
            Please select a date range to generate the report
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;


