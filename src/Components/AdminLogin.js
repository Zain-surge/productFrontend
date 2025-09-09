import { useState } from "react";
import axiosInstance from "../axiosInstance";
import { colors } from "../colors";

function AdminLogin({ setIsAdmin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/auth/admin-login",
        credentials,
        { withCredentials: true }
      );

      // Check if login was actually successful
      if (response.data.success) {
        setIsAdmin(true);
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };


  return (
    <div className="flex h-screen items-center justify-center bg-white text-white">
      <div
        className="w-full max-w-md p-8  rounded-xl shadow-lg"
        style={{ backgroundColor: "#074711" }}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          ADMIN LOGIN
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            required
            className="w-full p-3 rounded  text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
            className="w-full p-3 rounded   text-black"
          />
          <button
            type="submit"
            className="w-full p-3 rounded  transition font-bold"
            style={{ backgroundColor: colors.primaryRed }}
          >
            Login
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-sm text-center mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
