// src/api/axios.js
import axios from 'axios';

// Create an axios instance without a baseURL; callers include the full /api prefix
const instance = axios.create({
  // baseURL: '/api', // removed to avoid double prefix
  withCredentials: true,
});

// optional response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // you could add global toast here if you want
    return Promise.reject(error);
  }
);

export default instance;
