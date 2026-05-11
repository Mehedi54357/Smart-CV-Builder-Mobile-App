import axiosInstance from './axiosInstance';

export const profileAPI = {
  get: () => axiosInstance.get('/profile'),
  create: (data) => axiosInstance.post('/profile', data),
  update: (data) => axiosInstance.put('/profile', data),
  getCompletion: () => axiosInstance.get('/profile/completion'),
  syncAll: (data) => axiosInstance.post('/profile/sync', data),
  updatePhoto: (formData) =>
    axiosInstance.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const educationAPI = {
  getAll: () => axiosInstance.get('/education'),
  add: (data) => axiosInstance.post('/education', data),
  update: (id, data) => axiosInstance.put(`/education/${id}`, data),
  delete: (id) => axiosInstance.delete(`/education/${id}`),
};

export const experienceAPI = {
  getAll: () => axiosInstance.get('/experience'),
  add: (data) => axiosInstance.post('/experience', data),
  update: (id, data) => axiosInstance.put(`/experience/${id}`, data),
  delete: (id) => axiosInstance.delete(`/experience/${id}`),
};

export const projectAPI = {
  getAll: () => axiosInstance.get('/projects'),
  add: (data) => axiosInstance.post('/projects', data),
  update: (id, data) => axiosInstance.put(`/projects/${id}`, data),
  delete: (id) => axiosInstance.delete(`/projects/${id}`),
};

export const skillsAPI = {
  get: () => axiosInstance.get('/skills'),
  update: (data) => axiosInstance.put('/skills', data),
};
