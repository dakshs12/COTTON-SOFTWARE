import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const baseURL = isBrowser 
  ? `http://${window.location.hostname}:8000/api/` 
  : 'http://localhost:8000/api/';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Response Interceptor for handling 401s and refreshing tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Skip interception for auth endpoints to avoid loops
    if (originalRequest.url?.includes('token/') || originalRequest.url?.includes('auth/')) {
      return Promise.reject(error);
    }
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await axios.post(`${baseURL}token/refresh/`, {}, {
          withCredentials: true
        });
        
        // If successful, retry the original request.
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed. Dispatch event to gracefully pause session.
        if (typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')) {
          window.dispatchEvent(new Event('session-expired'));
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
