import axios from 'axios'

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = 'https://food-neupfrzzz-thehanzlas-projects.vercel.app/api'


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Sends cookies automatically
})

// --- START INTERCEPTOR LOGIC ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and it's NOT the refresh request itself
    if (error.response.status === 401 && originalRequest.url !== `${API_BASE_URL}/auth/refresh-token`) {

      if (isRefreshing) {
        // If already refreshing, queue the original request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      // Try to refresh the token
      try {
        // Use standard axios here to avoid interceptor loop
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });

        if (refreshResponse.status === 200) {
          isRefreshing = false;
          processQueue(null, refreshResponse.data.accessToken); // Process all queued requests
          return api(originalRequest); // Retry the original request
        }
      } catch (refreshError) {
        // Refresh failed (refresh token expired or invalid).
        console.error("Token refresh failed. Logging out user.");
        // Redirect to login page
        localStorage.removeItem('userData');
        window.location.href = '/login';
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, just return the error
    return Promise.reject(error);
  }
);
// --- END INTERCEPTOR LOGIC ---

export { api }