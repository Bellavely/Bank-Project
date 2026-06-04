import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && localStorage.getItem("token")) {
      try {
        const res = await api.post("/auth/refresh");
        const newToken = res.data.accessToken;

        localStorage.setItem("token", newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (err.response?.status === 404 || err.response?.status === 400) {
      toast.error(`${err.response.data.message}`);
      return Promise.reject(new Error(`err.response.data.message`));
    }

    return Promise.reject(err);
  },
);
