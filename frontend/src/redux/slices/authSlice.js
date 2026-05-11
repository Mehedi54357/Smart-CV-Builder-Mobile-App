import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../api/auth.api';

// ── Async Thunks ──────────────────────────────────────────────────

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getMe();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch user');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(data);
      await AsyncStorage.setItem('authToken', res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authAPI.verifyOTP(data);
      await AsyncStorage.setItem('authToken', res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('authToken');
    } catch (err) {
      await AsyncStorage.removeItem('authToken');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    otpSent: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { 
        s.isLoading = false; 
        s.error = null;
      })
      .addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
    // Login
      .addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.isLoading = false; s.isAuthenticated = true; s.user = a.payload.user; s.token = a.payload.token; })
      .addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
    // Verify OTP
      .addCase(verifyOTP.fulfilled, (s, a) => { s.isAuthenticated = true; s.token = a.payload.token; s.user = a.payload.user; })
    // Fetch Current User
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.isAuthenticated = true; s.user = a.payload.user; })
      .addCase(fetchCurrentUser.rejected, (s, a) => { 
        // Only logout if it's a 401/403 or specific auth error
        // If it's a network timeout (status 0 or no status), we keep them authenticated to try again
        const isAuthError = a.payload && (a.payload.includes('401') || a.payload.includes('403') || a.payload.includes('unauthorized'));
        if (isAuthError) {
          s.isAuthenticated = false; 
          s.user = null; 
          s.token = null; 
        }
      })
    // Logout
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.token = null; s.isAuthenticated = false; });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
