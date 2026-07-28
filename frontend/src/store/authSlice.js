import { createSlice } from '@reduxjs/toolkit';

const initialToken = sessionStorage.getItem('pharma_qms_token') || null;
const initialUser = (() => {
  try {
    const raw = sessionStorage.getItem('pharma_qms_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

const initialState = {
  token: initialToken,
  user: initialUser,
  error: null,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.error = null;
      try {
        sessionStorage.setItem('pharma_qms_token', token);
        sessionStorage.setItem('pharma_qms_user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to write auth to sessionStorage', e);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      try {
        sessionStorage.removeItem('pharma_qms_token');
        sessionStorage.removeItem('pharma_qms_user');
      } catch (e) {
        console.error('Failed to clear auth from sessionStorage', e);
      }
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
});

export const { setCredentials, logout, setAuthError, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
