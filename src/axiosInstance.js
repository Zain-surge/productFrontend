import axios from "axios";
import { FRONTEND_ID } from "./config";

const axiosInstance = axios.create({
  baseURL: "https://thevillage-backend.onrender.com",
  withCredentials: true,
});

// Add frontend ID to every request
axiosInstance.interceptors.request.use((config) => {
  config.headers["x-client-id"] = FRONTEND_ID;
  return config;
});

export default axiosInstance;
