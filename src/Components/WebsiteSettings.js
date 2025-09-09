import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateOfferStatus } from "../store/offersSlice";
import axiosInstance from "../axiosInstance";

function WebsiteSettings() {
  const [shopOpen, setShopOpen] = useState(null);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineItems, setOfflineItems] = useState([]);

  const offers = useSelector((state) => state.offers.list);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShopStatus = async () => {
      try {
        const res = await axiosInstance.get("/admin/shop-status", {
          withCredentials: true,
        });
        setShopOpen(res.data.shop_open);
        setOpenTime(res.data.shop_open_time || "");
        setCloseTime(res.data.shop_close_time || "");
      } catch (err) {
        console.error("Error fetching shop status:", err);
      }
    };

    fetchShopStatus();
  }, []);

  const updateTimings = async () => {
    try {
      await axiosInstance.put(
        "/admin/update-shop-timings",
        {
          shop_open_time: openTime,
          shop_close_time: closeTime,
        },
        { withCredentials: true }
      );
      alert("Shop timings updated successfully!");
    } catch (err) {
      console.error("Error updating shop timings:", err);
      alert("Failed to update shop timings.");
    }
  };

  const toggleShop = async () => {
    try {
      const updatedStatus = !shopOpen;
      await axiosInstance.put(
        "/admin/shop-toggle",
        { shop_open: updatedStatus },
        { withCredentials: true }
      );
      setShopOpen(updatedStatus);
      alert(`Shop is now ${updatedStatus ? "open" : "closed"}.`);
    } catch (error) {
      console.error("Error toggling shop status:", error);
      alert("Failed to toggle shop status.");
    }
  };

  const handleCheckboxChange = async (offer) => {
    try {
      await axiosInstance.put(
        "/admin/offers/update",
        {
          offer_text: offer.offer_text,
          value: !offer.value,
        },
        { withCredentials: true }
      );
      dispatch(
        updateOfferStatus({ offer_text: offer.offer_text, value: !offer.value })
      );
    } catch (err) {
      console.error("Error updating offer:", err);
      alert("Failed to update offer status.");
    }
  };

  const fetchCancelledOrders = async () => {
    try {
      const res = await axiosInstance.get("/admin/orders/cancelled", {
        withCredentials: true,
      });
      setCancelledOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching cancelled orders:", err);
      alert("Failed to fetch cancelled orders.");
    }
  };

  const refundOrder = async (orderId) => {
    try {
      await axiosInstance.post(
        "/orders/update-status",
        {
          order_id: orderId,
          status: "refunded",
          driver_id: null,
        },
        { withCredentials: true }
      );
      alert(`Order #${orderId} refunded successfully!`);
      fetchCancelledOrders();
    } catch (err) {
      console.error("Error refunding order:", err);
      alert("Failed to refund order.");
    }
  };

  const fetchOfflineItems = async () => {
    try {
      const res = await axiosInstance.get("/item/unavailable-items", {
        withCredentials: true,
      });
      setOfflineItems(res.data || []);
    } catch (err) {
      console.error("Error fetching offline items:", err);
      alert("Failed to fetch offline items.");
    }
  };

  const makeItemAvailable = async (itemId) => {
    try {
      await axiosInstance.put(
        "/item/set-availability",
        { item_id: itemId, availability: true },
        { withCredentials: true }
      );
      alert(`Item #${itemId} marked available!`);
      fetchOfflineItems();
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item availability.");
    }
  };

  return (
    <div className="space-y-10">
      {/* Shop Status */}
      <div className="flex justify-between items-center mx-12 lg:mx-60">
        <span
          className="text-base lg:text-2xl"
          style={{
            fontFamily: "Bambino",
            fontWeight: 550,
          }}
        >
          Shop Status
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={shopOpen}
            onChange={toggleShop}
          />
          <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-[#F2D9F9] transition duration-200"></div>
          <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6"></span>
        </label>
      </div>

      {/* Shop Timings */}
      <div className="flex flex-wrap justify-between items-center gap-4 mx-12 lg:mx-60">
        <div>
          <label
            className="font-semibold mb-1 text-base lg:text-2xl mr-4"
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Open Time
          </label>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="border p-2 rounded w-36"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          />
        </div>
        <div>
          <label
            className="font-semibold mb-1 text-base lg:text-2xl mr-4"
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Close Time
          </label>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="border p-2 rounded w-36"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          />
        </div>
        <div>
          <button
            onClick={updateTimings}
            className="bg-[#F2D9F9] hover:bg-[#D987EF] text-black px-6 py-2 rounded text-md lg:text-xl"
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Update Timings
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6">
        <button
          onClick={() => setShowOffersModal(true)}
          className="bg-[#F2D9F9] hover:bg-[#D987EF] text-black px-8 py-3 rounded text-md lg:text-xl"
          style={{
            fontFamily: "Bambino",
            fontWeight: 550,
          }}
        >
          Manage Offers
        </button>

        <button
          onClick={() => {
            fetchCancelledOrders();
            setShowCancelledModal(true);
          }}
          className="bg-[#F2D9F9] hover:bg-[#D987EF] text-black px-8 py-3 rounded text-md lg:text-xl"
          style={{
            fontFamily: "Bambino",
            fontWeight: 550,
          }}
        >
          Cancelled Orders
        </button>
        <button
          onClick={() => {
            fetchOfflineItems();
            setShowOfflineModal(true);
          }}
          className="bg-[#F2D9F9] hover:bg-[#D987EF] text-black px-8 py-3 rounded text-md lg:text-xl"
          style={{ fontFamily: "Bambino", fontWeight: 550 }}
        >
          Offline Items
        </button>
      </div>

      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-[90%] max-w-md h-[500px] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md lg:text-xl font-bold">Manage Offers</h2>
              <button
                onClick={() => setShowOffersModal(false)}
                className="text-gray-600 hover:text-red-500 text-md lg:text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {offers.map((offer, index) => (
                <label key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={offer.value}
                    onChange={() => handleCheckboxChange(offer)}
                    disabled={offer.locked}
                  />
                  {offer.offer_text}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Orders Modal */}
      {showCancelledModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-[95%] max-w-2xl h-[600px] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md lg:text-xl font-bold">Cancelled Orders</h2>
              <button
                onClick={() => setShowCancelledModal(false)}
                className="text-gray-600 hover:text-red-500 text-md lg:text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {cancelledOrders.length === 0 ? (
                <p>No cancelled orders found.</p>
              ) : (
                cancelledOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="border p-4 rounded shadow-sm flex flex-col md:flex-row md:justify-between md:items-center"
                  >
                    <div>
                      <p>
                        <strong>Order ID:</strong> {order.order_id}
                      </p>
                      <p>
                        <strong>Transaction:</strong>{" "}
                        {order.transaction_id || "N/A"}
                      </p>
                      <p>
                        <strong>Total:</strong> £{order.total_price}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p>
                        <strong>Customer:</strong> {order.customer_name} 
                      </p>
                      <p>
                        <strong>Customer Email:</strong> {order.customer_email}
                      </p>
                       <p>
                        <strong>Customer Phone:</strong> {order.customer_phone}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={() => refundOrder(order.order_id)}
                        className="bg-red-400 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Refund
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Offline Items Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 w-[95%] max-w-2xl h-[600px] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md lg:text-xl font-bold">Offline Items</h2>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-gray-600 hover:text-red-500 text-md lg:text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {offlineItems.length === 0 ? (
                <p>No offline items found.</p>
              ) : (
                offlineItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="border p-4 rounded shadow-sm flex flex-col md:flex-row md:justify-between md:items-center"
                  >
                    <div>
                      <p>
                        <strong>Name:</strong> {item.item_name}
                      </p>
                      <p>
                        <strong>Type:</strong> {item.type}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={() => makeItemAvailable(item.item_id)}
                        className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Make Available
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteSettings;
