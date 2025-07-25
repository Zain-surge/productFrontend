import React, { useState, useEffect, useRef } from "react";
import orderSound from "./assets/order-success.mp3";
import { colors } from "./colors";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import NavBar from "./Components/NavBar";
import OrderModal from "./Components/OrderModal";
import Menu from "./Components/Menu";
import Footer from "./Components/Footer";
import ContactUs from "./Components/ContactUs";
import ScrollToTop from "./Components/ScrollToTop";
import AdminLogin from "./Components/AdminLogin";
import AdminHome from "./Components/AdminHome";
import localMenuItems from "./menuItems.json";
import AdminNavBar from "./Components/AdminNavBar";
import AdminStatus from "./Components/AdminStatus";
import AdminDashboard from "./Components/AdminDashboard";
import { setTodayOrders } from "./store/ordersSlice";
import { setOffers, updateOfferStatus } from "./store/offersSlice";
import logo from "./images/tvpLogo.png";
import customFetch from "./customFetch"; // ✅

import { io } from "socket.io-client";
function App() {
  const [menuItems, setMenuItems] = useState(localMenuItems || []);

  const [isAdmin, setIsAdmin] = useState(true);
  const TodayOrders = useSelector((state) => state.orders.todayOrders);

  const offers = useSelector((state) => state.offers?.list);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await customFetch(
          "https://thevillage-backend.onrender.com/item/items"
        );
        const data = await response.json();
        console.log(data);
        const sortedData = data.sort((a, b) => a.title.localeCompare(b.title));

        console.log(sortedData);
        setMenuItems(sortedData);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const res = await customFetch(
          "https://thevillage-backend.onrender.com/orders/today",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("Grouped Orders:", data);
        dispatch(setTodayOrders(data)); // store in state
      } catch (err) {
        console.error("Failed to fetch today’s orders:", err);
      }
    };

    fetchTodayOrders();
  }, []);
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await customFetch(
          "https://thevillage-backend.onrender.com/admin/offers"
        );
        const offersData = await response.json();
        console.log("HELLO OFFERS:", offersData);
        dispatch(setOffers(offersData)); // ✅ Set in Redux
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, [dispatch]);

  useEffect(() => {
    console.log("OFFERS AFTER DISPATCH (updated):", offers);
  }, [offers]);

  return (
    <Router>
      <AppContent
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        menuItems={menuItems}
        offers={offers}
        TodayOrders={TodayOrders}
      />
    </Router>
  );
}

function AppContent({ isAdmin, setIsAdmin, menuItems, offers, TodayOrders }) {
  const [shopStatus, setShopStatus] = useState({
    open: null,
    openTime: "",
    closeTime: "",
  });
  // null = loading

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [newOrder, setNewOrder] = useState(null);
  const dispatch = useDispatch();
  const audioRef = useRef(null);

  useEffect(() => {
    // Preload the audio
    audioRef.current = new Audio(orderSound);
  }, []);
  useEffect(() => {
    const fetchShopStatus = async () => {
      try {
        const res = await customFetch(
          "https://thevillage-backend.onrender.com/admin/shop-status",
          {
            credentials: "include",
          }
        );
        const data = await res.json();

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

    socket.on("new_order", (orderData) => {
      console.log("📦 New order received from server:", orderData);
      setNewOrder(orderData);

      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Audio play failed:", error);
        });
      }
    });

    socket.on("offers_updated", (updatedOffers) => {
      console.log("🔥 Real-time offers update received:", updatedOffers);
      dispatch(setOffers(updatedOffers)); // Replace Redux offers
    });

    socket.on("shop_status_updated", (data) => {
      console.log("🟢 Shop status changed:", data);
      setShopStatus((prev) => ({
        ...prev,
        open: data.shop_open,
      }));
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  if (shopStatus.open === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading status...
      </div>
    );
  }

  if (!shopStatus.open && !isAdminRoute) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <img src={logo} alt="Logo" className="w-auto h-480 mb-4" />
        <h2 className="text-2xl font-bold">WE ARE CLOSED AT THE MOMENT</h2>
        <p className="text-gray-600 mt-2">
          Please visit us between{" "}
          <span className="font-semibold">{shopStatus.openTime}</span> and{" "}
          <span className="font-semibold">{shopStatus.closeTime}</span>
        </p>

        {/* Compact Contact Info */}
        <div
          className="mt-6 text-sm lg:text-base flex flex-wrap justify-center items-center gap-4 px-4 text-center"
          style={{
            fontFamily: "Bambino",
            fontWeight: 350,
            color: "inherit",
          }}
        >
          <a
            href="https://www.google.com/maps/place/The+Village+Pizzeria+Accrington"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-inherit flex items-center"
          >
            <FaMapMarkerAlt
              className="mr-1"
              style={{ color: colors.primaryGreen }}
            />
            3 Blackburn Rd, Accrington BB5 1HF
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="tel:+441254205542"
            className="hover:underline text-inherit flex items-center"
          >
            <FaPhoneAlt
              className="mr-1"
              style={{ color: colors.primaryGreen }}
            />
            +44 1254 205542
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="mailto:info@example.com"
            className="hover:underline text-inherit flex items-center"
          >
            <FaEnvelope
              className="mr-1"
              style={{ color: colors.primaryGreen }}
            />
            info@example.com
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://www.instagram.com/thevillagepizzeria.official"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-inherit flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={colors.primaryRed}
              className="w-4 h-4 mr-1 transition duration-300"
              onMouseEnter={(e) =>
                (e.currentTarget.style.fill = colors.primaryGreen)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.fill = colors.primaryRed)
              }
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
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/" element={<Menu menuItems={menuItems} />} />
        <Route path="/contact" element={<ContactUs />} />
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
        {/* <Route
          path="/admin/takeaway"
          element={
            isAdmin ? (
              <AdminStatus statusType="TakeAway" orderSource="EPOS" />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/DineIn"
          element={
            isAdmin ? (
              <AdminStatus statusType="DineIn" orderSource="EPOS" />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/Delivery"
          element={
            isAdmin ? (
              <AdminStatus statusType="Delivery" orderSource="EPOS" />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/MenuT"
          element={
            isAdmin ? (
              <AdminDashboard menuItems={menuItems} orderType={"TakeAway"} />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/MenuD"
          element={
            isAdmin ? (
              <AdminDashboard menuItems={menuItems} orderType={"DineIn"} />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/MenuDe"
          element={
            isAdmin ? (
              <AdminDashboard menuItems={menuItems} orderType={"Delivery"} />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        />
        <Route
          path="/admin/web"
          element={
            isAdmin ? (
              <AdminStatus statusType="delivery" orderSource="Website" />
            ) : (
              <AdminLogin setIsAdmin={setIsAdmin} />
            )
          }
        /> */}
      </Routes>
      {/* {isAdminRoute && newOrder && (
        <OrderModal order={newOrder} onAccept={() => setNewOrder(null)} />
      )} */}

      <ScrollToTop />
      {/* {isAdminRoute && <AdminNavBar />} */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
