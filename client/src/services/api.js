import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5126/api",
  timeout: 90_000, // free-tier backend can take up to a minute to wake from sleep
});

/* Cold-start detection: if any request is still pending after 3s, tell the UI the server is waking up. */
const SLOW_MS = 3000;
let slow = 0;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(slow > 0));
export const subscribeWaking = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.slowTimer = setTimeout(() => {
    config.wasSlow = true;
    slow += 1;
    emit();
  }, SLOW_MS);
  return config;
});

const settle = (config) => {
  if (!config) return;
  clearTimeout(config.slowTimer);
  if (config.wasSlow) {
    config.wasSlow = false;
    slow -= 1;
    emit();
  }
};

api.interceptors.response.use(
  (res) => {
    settle(res.config);
    return res;
  },
  (err) => {
    settle(err.config);
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(err);
  },
);

export const errorMessage = (err, fallback = "Something went wrong") => {
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  if (err?.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (err?.request && !err.response) return "Can't reach the server. Check your connection and try again.";
  return fallback;
};

export default api;
