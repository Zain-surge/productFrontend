import axios from "axios";
import { FRONTEND_ID } from "../config"; // adjust path as needed

const API = axios.create({
  baseURL: "https://thevillage-backend.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to inject x-client-id into every request
API.interceptors.request.use((config) => {
  config.headers["x-client-id"] = FRONTEND_ID;
  return config;
});

export const getCart = async (userId) => {
  console.log(userId);
  return await API.get(`/cart/getCart/${userId}`);
};

export const loginUser = async (formData) => {
  return await API.post("/auth/login", formData);
};

export const signUpUser = async (formData) => {
  return await API.post("/auth/signup", formData);
};

export const verifyOtp = async (data, otp) => {
  return await API.post("/auth/verify-otp", { data, otp });
};

export const logout = async () => {
  return await API.post("/auth/logout", {}, { withCredentials: true });
};

export const checkSession = async () => {
  return await API.get("/auth/check-session", { withCredentials: true });
};
