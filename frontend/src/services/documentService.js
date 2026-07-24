import { api } from './api.js';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function listDocuments() {
  const response = await api.get('/documents');
  return response.data.data;
}

export async function deleteDocument(id) {
  await api.delete(`/documents/${id}`);
}
