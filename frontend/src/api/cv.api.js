import axiosInstance from './axiosInstance';

export const cvAPI = {
  getAll: () => axiosInstance.get('/cv'),
  generate: (data) => axiosInstance.post('/cv/generate', data),
  getById: (id) => axiosInstance.get(`/cv/${id}`),
  delete: (id) => axiosInstance.delete(`/cv/${id}`),
  downloadPDF: (id) => axiosInstance.get(`/cv/${id}/download/pdf`),
  downloadDOCX: (id) => axiosInstance.get(`/cv/${id}/download/docx`),
  share: (id) => axiosInstance.post(`/cv/${id}/share`),
};

export const documentsAPI = {
  getAll: () => axiosInstance.get('/documents'),
  upload: (formData) =>
    axiosInstance.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => axiosInstance.delete(`/documents/${id}`),
};
