// src/api/api.ts
import axios from "axios";

// This is where we create a central Axios instance.
// We'll use this for all API requests to ensure consistent behavior.
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A "request" interceptor that adds the auth token to every request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A "response" interceptor that handles token expiration errors.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired, so we should log the user out.
      console.log('Token expired or invalid. Logging out.');
      localStorage.removeItem('token');
      // Redirect to the signin page.
      // In a real app, you would use a router here.
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// We can now export functions for specific API endpoints.
// This makes the rest of your app much cleaner.
export const getProjects = async () => {
  const response = await axiosInstance.get('/projects');
  return response.data;
};

export const createProject = async (projectData: Omit<{ id: string; name: string; description: string; isPrivate: boolean; mainCodeFolders: string[]; branchCodeFolders: string[]; textChannels: { id: string; name: string; }[]; videoChannels: { id: string; name: string; }[]; }, "id" | "mainCodeFolders" | "branchCodeFolders" | "textChannels" | "videoChannels">) => {
  const response = await axiosInstance.post('/projects', projectData);
  return response.data;
};

export const createFolder = async (projectId: string, folderData: { folderName: string; targetType: "main" | "branch"; }) => {
  const response = await axiosInstance.post(`/projects/${projectId}/folders`, folderData);
  return response.data;
};

export default axiosInstance;
