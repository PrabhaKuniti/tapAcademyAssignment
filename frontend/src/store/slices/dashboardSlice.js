import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../config/api';

const API_URL = '/api/dashboard';

// Get employee dashboard
export const getEmployeeDashboard = createAsyncThunk(
  'dashboard/getEmployeeDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/employee`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard'
      );
    }
  }
);

// Get manager dashboard
export const getManagerDashboard = createAsyncThunk(
  'dashboard/getManagerDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`${API_URL}/manager`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get dashboard'
      );
    }
  }
);

const initialState = {
  employeeDashboard: null,
  managerDashboard: null,
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.employeeDashboard = null;
      state.managerDashboard = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Employee dashboard
      .addCase(getEmployeeDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEmployeeDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeeDashboard = action.payload;
      })
      .addCase(getEmployeeDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Manager dashboard
      .addCase(getManagerDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getManagerDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.managerDashboard = action.payload;
      })
      .addCase(getManagerDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboard, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;


