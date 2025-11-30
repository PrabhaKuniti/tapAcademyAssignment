import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import {
  getAllAttendance,
  exportAttendance,
  getTodayStatus,
} from '../../store/slices/attendanceSlice';
import apiClient from '../../config/api';
import 'react-calendar/dist/Calendar.css';
import './TeamAttendance.css';

const TeamAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance, isLoading } = useSelector((state) => state.attendance);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    dispatch(getTodayStatus());
  }, [dispatch]);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/api/users');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchAttendance = () => {
    dispatch(getAllAttendance(filters));
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleExport = async () => {
    try {
      await dispatch(exportAttendance(filters)).unwrap();
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error(error || 'Export failed');
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

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allAttendance.filter((record) => {
      const recordDate = format(new Date(record.date), 'yyyy-MM-dd');
      return recordDate === dateStr;
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const attendance = getAttendanceForDate(date);
      if (attendance && attendance.length > 0) {
        return 'calendar-day';
      }
    }
    return null;
  };

  return (
    <div className="container">
      <h1>Team Attendance</h1>

      {/* Filters */}
      <div className="card">
        <h2>Filters</h2>
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
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
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
                status: '',
              })
            }
          >
            Clear Filters
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="card">
        <div className="view-toggle">
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          <h2>Team Calendar View</h2>
          <div className="calendar-wrapper">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
            />
          </div>
          <div className="selected-date-attendance">
            <h3>
              Attendance for {format(selectedDate, 'MMMM dd, yyyy')}
            </h3>
            {getAttendanceForDate(selectedDate).length > 0 ? (
              <div className="table-responsive">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAttendanceForDate(selectedDate).map((record, index) => (
                      <tr key={index}>
                        <td>{record.userId?.name}</td>
                        <td>{record.userId?.employeeId}</td>
                        <td>{record.userId?.department}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center">No attendance records for this date</p>
            )}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card">
          <h2>Attendance Records</h2>
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
                      <td colSpan="8" className="text-center">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;


