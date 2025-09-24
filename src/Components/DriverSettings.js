import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

function DriverSettings() {
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDeactivateDriver, setShowDeactivateDriver] = useState(false);
  const [showDriverPortal, setShowDriverPortal] = useState(true);
  const [activeAction, setActiveAction] = useState("portal"); // "add" | "deactivate" | "portal"

  // Add Driver form
  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    username: "",  
    password: "",
    phone_number: "",
  });

  // Deactivate Driver form
  const [deactivateUsername, setDeactivateUsername] = useState("");

  // Driver Portal state
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Navigation handlers
  const handleAddClick = () => {
    setActiveAction("add");
    setShowAddDriver(true);
    setShowDeactivateDriver(false);
    setShowDriverPortal(false);
  };

  const handleDeactivateClick = () => {
    setActiveAction("deactivate");
    setShowAddDriver(false);
    setShowDeactivateDriver(true);
    setShowDriverPortal(false);
  };

  const handlePortalClick = () => {
    setActiveAction("portal");
    setShowAddDriver(false);
    setShowDeactivateDriver(false);
    setShowDriverPortal(true);
  };

  // Add Driver API
  const handleAddDriver = async () => {
    try {
      const res = await axiosInstance.post("/drivers/create", driverForm);
      alert("✅ Driver added: " + res.data.driver.name);
      setDriverForm({
        name: "",
        email: "",
        username: "",
        password: "",
        phone_number: "",
      });
      setShowAddDriver(false);
    } catch (err) {
      console.error("Error adding driver:", err);
      alert("❌ Failed to add driver");
    }
  };

  // Deactivate Driver API
  const handleDeactivateDriver = async () => {
    try {
      const res = await axiosInstance.put(
        `/drivers/deactivate/${deactivateUsername}`
      );
      alert("✅ Driver deactivated: " + res.data.driver.name);
      setDeactivateUsername("");
      setShowDeactivateDriver(false);
    } catch (err) {
      console.error("Error deactivating driver:", err);
      alert("❌ Failed to deactivate driver");
    }
  };

  // Fetch driver portal data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/drivers/orders-with-driver/${date}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching driver report:", err);
      alert("❌ Failed to fetch driver report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDriverPortal) {
      fetchOrders();
    }
  }, [date, showDriverPortal]);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Navigation buttons */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 mx-auto w-full md:w-[70rem]"
      >
        <div className="flex justify-center">
          <button
            onClick={handlePortalClick}
            className={`px-8 py-3 rounded text-md lg:text-xl w-full transition-colors duration-200 ${activeAction === "portal"
              ? "bg-[#EBEBEB] text-black"
              : "bg-black text-white "
              }`}
            style={{ fontFamily: "Bambino", fontWeight: 550 }}
          >
            Driver Portal
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleAddClick}
            className={`px-0 md:px-8 py-3 rounded text-md lg:text-xl w-full transition-colors duration-200 ${activeAction === "add"
              ? "bg-[#EBEBEB] text-black"
              : "bg-black text-white "
              }`}
            style={{ fontFamily: "Bambino", fontWeight: 550 }}
          >
            Add Driver
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleDeactivateClick}
            className={`px-8 py-3 rounded text-md lg:text-xl w-full transition-colors duration-200 ${activeAction === "deactivate"
              ? "bg-[#EBEBEB] text-black"
              : "bg-black text-white "
              }`}
            style={{ fontFamily: "Bambino", fontWeight: 550 }}
          >
            Deactivate Driver
          </button>
        </div>
        
      </div>

      {/* Add Driver Form */}
      {showAddDriver && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Bambino" }}>
            Add New Driver
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["name", "email", "username", "password", "phone_number"].map(
              (field) => (
                <input
                  key={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={field.replace("_", " ").toUpperCase()}
                  value={driverForm[field]}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, [field]: e.target.value })
                  }
                  className="w-full border p-3 rounded"
                  style={{ fontFamily: "Bambino" }}
                />
              )
            )}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              style={{ fontFamily: "Bambino", fontWeight: 550 }}
              onClick={() => setShowAddDriver(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              style={{ fontFamily: "Bambino", fontWeight: 550 }}
              onClick={handleAddDriver}
            >
              Add Driver
            </button>
          </div>
        </div>
      )}

      {/* Deactivate Driver Form */}
      {showDeactivateDriver && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "Bambino" }}>
            Deactivate Driver
          </h3>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter Username"
              value={deactivateUsername}
              onChange={(e) => setDeactivateUsername(e.target.value)}
              className="w-full border p-3 rounded mb-4"
              style={{ fontFamily: "Bambino" }}
            />
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                style={{ fontFamily: "Bambino", fontWeight: 550 }}
                onClick={() => setShowDeactivateDriver(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
                style={{ fontFamily: "Bambino", fontWeight: 550 }}
                onClick={handleDeactivateDriver}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Portal */}
      {showDriverPortal && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-6 shadow-lg">
          {/* Date Picker */}
          <div className="mb-6 flex items-center gap-4">
            <label
              className="text-lg font-semibold"
              style={{ fontFamily: "Bambino" }}
            >
              Select Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-4 py-2 rounded"
              style={{ fontFamily: "Bambino" }}
            />
          </div>

          {/* Orders List */}
          {loading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <p>No orders found for this date.</p>
          ) : (
            <div className="relative">
              {/* vertical separators centered between columns */}
              <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-gray-300" />
              <div className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-gray-300" />

              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                {(() => {
                  // split orders
                  const nonBlue = orders.filter((o) => o.status !== "blue");
                  const blue = orders.filter((o) => o.status === "blue");

                  // render helper for an order item
                  const renderOrder = (order) => {
                    debugger 
                    // Parse order date & time as UTC
                    const orderDateTime = new Date(`${date}T${order.order_time}Z`); // "Z" means UTC

                    // Get current UTC time
                    const now = new Date();

                    // Calculate difference in minutes
                    const diffMinutes = (now - orderDateTime) / (1000 * 60);


                    let bgColor = "";
                    if (order.status === "blue") bgColor = "bg-[#D6D6D6] text-black";
                    else if (diffMinutes < 30) bgColor = "bg-[#DFF5D5] text-black";
                    else if (diffMinutes <= 45) bgColor = "bg-[#FEF6D6] text-black";
                    else bgColor = "bg-[#FDC9C9] text-black";

                    return (
                      <li key={order.order_id} className="col-span-1 p-4">
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-1 py-1 md:px-3 md:py-3 rounded-full ${bgColor} text-base md:text-2xl cursor-pointer w-32 text-center`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            {order.driver_name}
                          </span>

                          <span
                            className={`px-1 py-1 md:px-3 md:py-3 rounded-full ${bgColor} text-base md:text-2xl cursor-pointer w-32 text-center`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            {order.customer_postal_code}
                          </span>
                        </div>
                      </li>
                    );
                  };

                  // build an array of nodes to render
                  const nodes = [];

                  // non-blue first
                  nonBlue.forEach((o) => nodes.push(renderOrder(o)));

                  // divider only if both groups exist
                  if (nonBlue.length > 0 && blue.length > 0) {
                    nodes.push(
                      <li key="blue-divider" className="col-span-3 flex items-center">
                        <div className="w-full h-px bg-gray-300 my-2" />
                        
                      </li>
                    );
                  }

                  // then blue orders
                  blue.forEach((o) => nodes.push(renderOrder(o)));

                  return nodes;
                })()}
              </ul>
            </div>





          )}

          {/* Receipt Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg w-[40rem] shadow-lg relative">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Order Receipt</h2>
                <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Address:</strong> {selectedOrder.street_address}, {selectedOrder.city}, {selectedOrder.county}, {selectedOrder.postal_code}</p>
                <p><strong>Driver:</strong> {selectedOrder.driver_name} ({selectedOrder.driver_phone})</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Order Placed At:</strong> {selectedOrder.order_time}</p>
                <p><strong>Total Price:</strong> ${selectedOrder.total_price}</p>

                <h3 className="mt-4 font-semibold">Items:</h3>
                <ul className="list-disc ml-6">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.item_name} (x{item.quantity}) - ${item.total_price}
                      <br />
                      <em>{item.description}</em>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DriverSettings;
