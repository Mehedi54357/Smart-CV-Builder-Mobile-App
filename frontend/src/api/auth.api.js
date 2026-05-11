import axiosInstance from './axiosInstance';

export const authAPI = {
  getMe: () => axiosInstance.get('/auth/me'),
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  sendOTP: (data) => axiosInstance.post('/auth/send-otp', data),
  verifyOTP: (data) => axiosInstance.post('/auth/verify-otp', data),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.put('/auth/reset-password', data),
  logout: () => axiosInstance.post('/auth/logout'),
};
