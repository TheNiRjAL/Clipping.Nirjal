import axios from 'axios';
import { Job, ClipSettings } from '../types';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const uploadVideo = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<Job> => {
  const response = await API.get(`/jobs/${jobId}`);
  return response.data;
};

export const startProcessing = async (jobId: string, settings: ClipSettings): Promise<any> => {
  const response = await API.post(`/jobs/${jobId}/process`, settings);
  return response.data;
};

export const getClips = async (jobId: string): Promise<any[]> => {
  const response = await API.get(`/jobs/${jobId}/clips`);
  return response.data;
};

export const downloadClip = (clipId: string): void => {
  window.location.href = `http://localhost:5000/api/clips/${clipId}/download`;
};

export const downloadAllClips = (jobId: string): void => {
  window.location.href = `http://localhost:5000/api/jobs/${jobId}/download-all`;
};

export const checkHealth = async (): Promise<any> => {
  try {
    const response = await API.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error' };
  }
};
