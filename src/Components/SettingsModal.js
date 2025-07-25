import React, { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { updateOfferStatus } from "../store/offersSlice";
import axiosInstance from "../axiosInstance";

function SettingsModal({ onClose }) {
  const [showOffers, setShowOffers] = useState(false);
  const [shopOpen, setShopOpen] = useState(null);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

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
        console.log(res.data.shop_open_time);
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
    } catch (err) {
      console.error("Error updating shop timings:", err);
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
    } catch (error) {
      console.error("Error toggling shop status:", error);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-md p-5 w-[400px] h-[500px] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Shop Status</span>
            <button
              onClick={toggleShop}
              className={`px-3 py-1 rounded text-white ${
                shopOpen
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {shopOpen ? "Open" : "Closed"}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Shop Open Time</label>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Shop Close Time</label>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          onClick={updateTimings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
        >
          Update Timings
        </button>

        <div>
          <div
            className="flex items-center justify-between cursor-pointer border-b py-2"
            onClick={() => setShowOffers(!showOffers)}
          >
            <span className="font-semibold">Offers</span>
            {showOffers ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>

          {showOffers && (
            <div className="pl-2 mt-2 space-y-2">
              {offers.map((offer, index) => (
                <label key={index} className="flex items-center gap-2">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
