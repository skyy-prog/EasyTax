import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const api = axios.create({
  baseURL,
});

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response?.status >= 500) {
    return "The EasyTax API is unavailable right now. Check that the backend is running and try again.";
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return "Cannot reach the EasyTax API. Check that the backend is running and VITE_API_URL is configured.";
  }

  return fallbackMessage;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
