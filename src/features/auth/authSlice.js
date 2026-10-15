import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, user, isAuthenticated: !!(token && user) };
  } catch { return { token: null, user: null, isAuthenticated: false }; }
};

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
  } catch (err) {
    const errData = err.response?.data;
    return rejectWithValue(errData || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const getMeThunk = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const initialState = { ...loadFromStorage(), isLoading: false, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setTokens(state, action) {
      state.token = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.accessToken}`;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.isLoading = true; state.error = null; };
    const handleAuthFulfilled = (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.accessToken}`;
    };
    const handleRejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(loginThunk.pending, handlePending)
      .addCase(loginThunk.fulfilled, handleAuthFulfilled)
      .addCase(loginThunk.rejected, handleRejected)
      .addCase(registerThunk.pending, handlePending)
      .addCase(registerThunk.fulfilled, handleAuthFulfilled)
      .addCase(registerThunk.rejected, handleRejected)
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      });
  },
});

export const { logout, updateUser, setTokens } = authSlice.actions;
export default authSlice.reducer;
