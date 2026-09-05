import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_URL } from '../config';

/**
 * API Client with error handling and retry logic
 */
const API = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: false, // Set to true if using cookies for auth
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API] Response Error:', error.message);
    
    if (error.response?.status === 404) {
      console.error('[API] Backend not found. Check VITE_API_URL configuration.');
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const uploadVideo = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('video', file);
  
  try {
    const response = await API.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    console.error('[API] Upload failed:', error);
    throw error;
  }
};

export const processVideo = async (videoId: string, params: any): Promise<any> => {
  try {
    const response = await API.post(`/process/${videoId}`, params);
    return response.data;
  } catch (error) {
    console.error('[API] Process failed:', error);
    throw error;
  }
};

export const getStatus = async (jobId: string): Promise<any> => {
  try {
    const response = await API.get(`/status/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Status check failed:', error);
    throw error;
  }
};

export const downloadClip = async (clipId: string): Promise<Blob> => {
  try {
    const response = await API.get(`/download/${clipId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('[API] Download failed:', error);
    throw error;
  }
};

export const getProjects = async (): Promise<any[]> => {
  try {
    const response = await API.get('/projects');
    return response.data;
  } catch (error) {
    console.error('[API] Get projects failed:', error);
    throw error;
  }
};

export const getProjectDetails = async (projectId: string): Promise<any> => {
  try {
    const response = await API.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('[API] Get project details failed:', error);
    throw error;
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await API.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
};

export default API;
