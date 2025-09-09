import { useState, useEffect } from "react";
import { colors } from "./colors";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import NavBar from "./Components/NavBar";
import OrderTracking from "./Components/OrderTracking";
import Menu from "./Components/Menu";
import Footer from "./Components/Footer";
import ContactUs from "./Components/ContactUs";
import ScrollToTop from "./Components/ScrollToTop";
import AdminLogin from "./Components/AdminLogin";
import AdminHome from "./Components/AdminHome";
import { setOffers } from "./store/offersSlice";
import logo from "./images/tvpLogo.png";
import axiosInstance from "./axiosInstance";
import { FRONTEND_ID } from "./config";

import { setMenuItems, setMenuItemsLoading, setMenuItemsError, updateItemAvailability } from "./store/menuItemsSlice";
import { useSelector } from "react-redux";


import { io } from "socket.io-client";
function App() {
  // const [menuItems, setMenuItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        dispatch(setMenuItemsLoading(true));
        const response = await axiosInstance.get("/item/items");
        const sortedData = response.data.sort((a, b) => a.title.localeCompare(b.title));
        dispatch(setMenuItems(sortedData));
      } catch (error) {
        console.error("Error fetching menu items:", error);
        dispatch(setMenuItemsError(error.message));
      }
    };
    fetchMenuItems();
  }, [dispatch]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axiosInstance.get("/admin/offers");
        
        dispatch(setOffers(response.data));
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, [dispatch]);

  return (
    <Router>
      <AppContent
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      // menuItems={menuItems}
      />
    </Router>
  );
}

function AppContent({ isAdmin, setIsAdmin }) {
  const [shopStatus, setShopStatus] = useState({
    open: null,
    openTime: "",
    closeTime: "",
  });
  // null = loading

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShopStatus = async () => {
      try {
        const res = await axiosInstance.get("/admin/shop-status", {
          withCredentials: true,
        });
        const data = await res.data;

        setShopStatus({
          open: data.shop_open,
          openTime: data.shop_open_time,
          closeTime: data.shop_close_time,
        });
      } catch (error) {
        console.error("Error fetching shop status:", error);
        setShopStatus({
          open: true, // default to open on failure
          openTime: "12:00",
          closeTime: "23:00",
        });
      }
    };

    fetchShopStatus();
  }, []);



  useEffect(() => {
    const socket = io("https://thevillage-backend.onrender.com", {
      withCredentials: true,
      transports: ["websocket"], // Ensure it uses WebSocket
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to backend socket:", socket.id);
    });

    socket.on("offers_updated", (updatedAdmin) => {
      debugger
      if (updatedAdmin.brand_name == FRONTEND_ID) {
        console.log("🔥 Real-time offers update received:", updatedAdmin.offers);
        dispatch(setOffers(updatedAdmin.offers)); // Replace Redux offers
      }

    });

    socket.on("shop_status_updated", (data) => {
      if (data.brand_name == FRONTEND_ID) {
        console.log("🟢 Shop status changed:", data);
        setShopStatus((prev) => ({
          ...prev,
          open: data.shop_open,
        }));
      }

    });

    socket.on("shop_time_changed", (data) => {
      console.log("DATA", data)
      if (data.brand_name == FRONTEND_ID) {
        console.log("🕒 Shop open/close time changed:", data);
        setShopStatus((prev) => ({
          ...prev,
          openTime: data.new_open_time || prev.openTime,
          closeTime: data.new_close_time || prev.closeTime,
        }));
      }
    });
    // Replace the existing item_availability_changed listener with:
    socket.on("item_availability_changed", (data) => {
      console.log("📦 Item availability changed:", data);
      console.log("📦 Socket data structure:", JSON.stringify(data, null, 2));

      if (data.brand_name == FRONTEND_ID) {
        console.log("📦 Dispatching updateItemAvailability with:", {
          item_id: data.item_id,
          new_availability: data.new_availability
        });

        // Update Redux store instead of local state
        dispatch(updateItemAvailability({
          item_id: data.item_id,
          new_availability: data.new_availability
        }));
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  if (shopStatus.open === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading status...
      </div>
    );
  }

  if (!shopStatus.open && !isAdminRoute) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center text-black">
        {/* Logo */}
        <img
          src={logo}
          alt="Logo"
          className="w-40 md:w-52 lg:w-64 mb-6 drop-shadow-lg"
        />

        {/* Status Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-black">
          WE ARE CLOSED RIGHT NOW!
        </h2>
        <p className="text-gray-800 mt-3 text-base md:text-lg max-w-md">
          Please visit us between{" "}
          <span className="font-bold" style={{ color: colors.primaryGreen }}>
            {shopStatus.openTime}
          </span>{" "}
          and{" "}
          <span className="font-bold" style={{ color: colors.primaryGreen }}>
            {shopStatus.closeTime}
          </span>
        </p>

        {/* Divider */}
        <div className="w-16 h-1 rounded-full mt-6" style={{ backgroundColor: colors.primaryGreen }}></div>

        {/* Compact Contact Info */}
        <div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm md:text-base w-full max-w-2xl"
          style={{
            fontFamily: "Bambino",
            fontWeight: 350,
          }}
        >
          <a
            href="https://www.google.com/maps/place/The+Village+Pizzeria+Accrington"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/10 bg-white/5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition shadow-lg"
          >
            <FaMapMarkerAlt style={{ color: colors.primaryGreen }} />
            3 Blackburn Rd, Accrington BB5 1HF
          </a>

          <a
            href="tel:+441254205542"
            className="hover:bg-white/10 bg-white/5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition shadow-lg"
          >
            <FaPhoneAlt style={{ color: colors.primaryGreen }} />
            +44 1254 205542
          </a>

          <a
            href="mailto:info@example.com"
            className="hover:bg-white/10 bg-white/5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition shadow-lg"
          >
            <FaEnvelope style={{ color: colors.primaryGreen }} />
            info@example.com
          </a>

          <a
            href="https://www.instagram.com/thevillagepizzeria.official"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-white/10 bg-white/5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={colors.primaryRed}
              className="w-4 h-4"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.416.407a4.92 4.92 0 0 1 1.68 1.094c.486.487.85 1.047 1.094 1.68.167.446.353 1.246.407 2.416.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.407 2.416a4.92 4.92 0 0 1-1.094 1.68c-.487.486-1.047.85-1.68 1.094-.446.167-1.246.353-2.416.407-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.416-.407a4.92 4.92 0 0 1-1.68-1.094c-.486-.487-.85-1.047-1.094-1.68-.167-.446-.353-1.246-.407-2.416-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.407-2.416a4.92 4.92 0 0 1 1.094-1.68c.487-.486 1.047-.85 1.68-1.094.446-.167 1.246-.353 2.416-.407C8.416 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.332.013 7.05.072 5.77.13 4.885.313 4.155.595 3.315.903 2.672 1.347 2.03 1.99c-.642.643-1.087 1.285-1.395 2.125-.282.73-.465 1.615-.523 2.895C.013 8.332 0 8.74 0 12s.013 3.668.072 4.95c.058 1.28.241 2.165.523 2.895.308.84.753 1.482 1.395 2.125.642.642 1.285 1.087 2.125 1.395.73.282 1.615.465 2.895.523C8.332 23.987 8.74 24 12 24s3.668-.013 4.95-.072c1.28-.058 2.165-.241 2.895-.523.84-.308 1.482-.753 2.125-1.395.642-.642 1.087-1.285 1.395-2.125.282-.73.465-1.615.523-2.895C23.987 15.668 24 15.26 24 12s-.013-3.668-.072-4.95c-.058-1.28-.241-2.165-.523-2.895-.308-.84-.753-1.482-1.395-2.125-.642-.642-1.285-1.087-2.125-1.395-.73-.282-1.615-.465-2.895-.523C15.668.013 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zm0 10.162a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-10.845a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88z" />
            </svg>
            Instagram
          </a>
        </div>
      </div>

    );
  }

  return (
    <div className="App">
      {!isAdminRoute && <NavBar />}
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route
          path="/admin"
          element={
            isAdmin ? <AdminHome /> : <AdminLogin setIsAdmin={setIsAdmin} />
          }
        />
        <Route
          path="/admin/home"
          element={
            isAdmin ? <AdminHome /> : <AdminLogin setIsAdmin={setIsAdmin} />
          }
        />
      </Routes>
      <ScrollToTop />
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
