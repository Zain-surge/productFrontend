import axios from "axios";

const API = axios.create({
  baseURL: "https://thevillage-backend.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to log request details
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Redirect to login or refresh session
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

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
  return await API.post("auth/logout", {}, { withCredentials: true });
};

export const checkSession = async () => {
  return await API.get("/auth/check-session", { withCredentials: true });
};
