import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/api';

const API_URL = '/api/attendance';

// Check in
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`${API_URL}/checkin`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Check-in failed'
      );
    }
  }
);

// Check out
export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`${API_URL}/checkout`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Check-out failed'
      );
    }
  }
);

// Get today's attendance
export const getTodayAttendance = createAsyncThunk(
  'attendance/getTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/today`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get today attendance'
      );
    }
  }
);

// Get my attendance history
export const getMyAttendanceHistory = createAsyncThunk(
  'attendance/getMyAttendanceHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await apiClient.get(`${API_URL}/my-history`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get attendance history'
      );
    }
  }
);

// Get my monthly summary
export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await apiClient.get(`${API_URL}/my-summary`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get summary'
      );
    }
  }
);

// Manager: Get all attendance
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/all`, { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get attendance'
      );
    }
  }
);

// Manager: Get employee attendance
export const getEmployeeAttendance = createAsyncThunk(
  'attendance/getEmployeeAttendance',
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await apiClient.get(`${API_URL}/employee/${id}`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get employee attendance'
      );
    }
  }
);

// Manager: Get today status
export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/today-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get today status'
      );
    }
  }
);

// Manager: Export CSV
export const exportAttendance = createAsyncThunk(
  'attendance/exportAttendance',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/export`, {
        params: filters,
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return 'Export successful';
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Export failed'
      );
    }
  }
);

const initialState = {
  todayAttendance: null,
  myHistory: [],
  mySummary: null,
  allAttendance: [],
  todayStatus: null,
  isLoading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttendance: (state) => {
      state.todayAttendance = null;
      state.myHistory = [];
      state.mySummary = null;
      state.allAttendance = [];
      state.todayStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check in
      .addCase(checkIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayAttendance = action.payload.attendance;
        state.error = null;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Check out
      .addCase(checkOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayAttendance = action.payload.attendance;
        state.error = null;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get today attendance
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendance = action.payload;
      })
      // Get my history
      .addCase(getMyAttendanceHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyAttendanceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myHistory = action.payload;
      })
      .addCase(getMyAttendanceHistory.rejected, (state) => {
        state.isLoading = false;
      })
      // Get my summary
      .addCase(getMySummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySummary = action.payload;
      })
      .addCase(getMySummary.rejected, (state) => {
        state.isLoading = false;
      })
      // Get all attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allAttendance = action.payload;
      })
      .addCase(getAllAttendance.rejected, (state) => {
        state.isLoading = false;
      })
      // Get today status
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload;
      })
      // Get employee attendance
      .addCase(getEmployeeAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload;
      });
  },
});

export const { clearError, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;


