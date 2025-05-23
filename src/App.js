import React, { useState, useEffect } from "react";
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
import useOrderSocket from "./Components/useOrderSocket";
function App() {
  const [menuItems, setMenuItems] = useState(localMenuItems || []);

  const [isAdmin, setIsAdmin] = useState(true);
  const dispatch = useDispatch();
  const TodayOrders = useSelector((state) => state.orders.todayOrders);

  const [offers, setOffers] = useState([
    {
      value: true,
      offer_text: "15% Off on all items",
    },
    {
      value: false,
      offer_text: "Buy 2 Get 1 Free",
    },
    {
      value: true,
      offer_text: "Free Delivery",
    },
  ]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
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
    const fetchOffers = async () => {
      try {
        const response = await fetch(
          "https://thevillage-backend.onrender.com/admin/offers"
        );
        const offersData = await response.json();
        console.log("Offers:", offersData);
        setOffers(offersData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchMenuItems();
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchTodayOrders = async () => {
      try {
        const res = await fetch(
          "https://thevillage-backend.onrender.com/orders/today",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("Grouped Orders:", data);
        setTodayOrders(data); // store in state
      } catch (err) {
        console.error("Failed to fetch today’s orders:", err);
      }
    };

    fetchTodayOrders();
  }, []);

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
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [newOrder, setNewOrder] = useState(null);

  useOrderSocket((order) => {
    setNewOrder(order);
  });

  return (
    <div className="App">
      {!isAdminRoute && <NavBar />}
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route
          path="/"
          element={<Menu menuItems={menuItems} offers={offers} />}
        />
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
        <Route
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
        />
      </Routes>
      {newOrder && (
        <OrderModal order={newOrder} onAccept={() => setNewOrder(null)} />
      )}

      <ScrollToTop />
      {isAdminRoute && <AdminNavBar />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
