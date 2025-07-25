import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateOfferStatus } from "../store/offersSlice";
import SalesGrowthPieChart from "./SalesGrowthPieChart.js";
import axiosInstance from "../axiosInstance";
import DistributionPieCharts from "./DistributionPieCharts";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
function AdminHome() {
  const [activeTab, setActiveTab] = useState("website"); // Default to Website Settings
  const [shopOpen, setShopOpen] = useState(null);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [showOffersModal, setShowOffersModal] = useState(false);

  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDeactivateDriver, setShowDeactivateDriver] = useState(false);

  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone_number: "",
  });
  const [deactivateUsername, setDeactivateUsername] = useState("");

  const [reportType, setReportType] = useState(null); // "daily", "weekly", "monthly"
  const [reportData, setReportData] = useState(null);

  const [activeAction, setActiveAction] = useState("add");
  const [activeReport, setActiveReport] = useState("today");

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

  const fetchReport = async (type) => {
    setActiveReport(type);
    try {
      const res = await axiosInstance.get(`/admin/sales-report/${type}`);
      setReportData(res.data);
      console.log("REPORT DATA", reportData);
      setReportType(type);
    } catch (err) {
      console.error(`Error fetching ${type} report:`, err);
    }
  };

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
  const handleAddClick = () => {
    setActiveAction("add");
    setShowAddDriver(true);
    setShowDeactivateDriver(false);
  };

  const handleDeactivateClick = () => {
    setActiveAction("deactivate");
    setShowAddDriver(false);
    setShowDeactivateDriver(true);
  };

  const renderWebsiteSettings = () => (
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

      {/* Offers Button */}
      <div className="flex justify-center">
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
      </div>
    </div>
  );

  const renderDriverSettings = () => (
    <div className="space-y-8">
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto"
        style={{ width: "50rem" }}
      >
        <div className="flex justify-center">
          <button
            onClick={handleAddClick}
            className={`px-8 py-3 rounded text-md lg:text-xl w-full transition-colors duration-200 ${
              activeAction === "add"
                ? "bg-[#EBEBEB] text-black"
                : "bg-black text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Add Driver
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleDeactivateClick}
            className={`px-8 py-3 rounded text-md lg:text-xl w-full transition-colors duration-200 ${
              activeAction === "deactivate"
                ? "bg-[#EBEBEB] text-black"
                : "bg-black text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Deactivate Driver
          </button>
        </div>
      </div>

      {/* Add Driver Form */}
      {showAddDriver && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-6 shadow-lg">
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "Bambino" }}
          >
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
              onClick={async () => {
                try {
                  const res = await axiosInstance.post(
                    "/drivers/create",
                    driverForm
                  );
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
              }}
            >
              Add Driver
            </button>
          </div>
        </div>
      )}

      {/* Deactivate Driver Form */}
      {showDeactivateDriver && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-6 shadow-lg">
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "Bambino" }}
          >
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
                onClick={async () => {
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
                }}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8">
      {/* Report Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mx-auto w-[60rem]">
        {["today", "weekly", "monthly"].map((type) => (
          <button
            key={type}
            onClick={() => fetchReport(type)}
            className={`px-8 py-3 w-[16rem] rounded text-md lg:text-xl transition-colors duration-200 ${
              activeReport === type
                ? "bg-[#EBEBEB] text-black"
                : "bg-black text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            {type === "today" && "Daily Report"}
            {type === "weekly" && "Weekly Report"}
            {type === "monthly" && "Monthly Report"}
          </button>
        ))}
      </div>

      {/* Report Data */}
      {reportData && (
        <div className="mx-12 lg:mx-24 bg-white border rounded-lg p-4 shadow-lg items-center">
          <div className="text-lg font-bold mb-6 text-white bg-black rounded-lg w-fit mx-auto px-6 py-2">
            {reportType?.charAt(0).toUpperCase() + reportType?.slice(1)} Report
          </div>
          <div className="grid grid-cols-3">
            <div className="col-span-1">
              <div
                className="text-sm space-y-4"
                style={{ fontFamily: "Bambino" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Period */}
                  <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                    Period
                  </div>
                  <div className="bg-gray-200 text-black p-2 rounded">
                    {reportData.date ||
                      `${reportData.period?.from} → ${reportData.period?.to}`}
                  </div>

                  {/* Total Sales */}
                  <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                    Total Sales
                  </div>
                  <div className="bg-gray-200 text-black p-2 rounded">
                    {reportData.total_sales}
                  </div>

                  {/* Sales by Payment Type */}
                  {reportData.sales_by_payment_type?.map((p, idx) => (
                    <React.Fragment key={`paytype-${idx}`}>
                      <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                        {p.payment_type}
                      </div>
                      <div className="bg-gray-200 text-black p-2 rounded">
                        {p.count} orders — {p.total}
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Sales by Order Type */}
                  {reportData.sales_by_order_type?.map((p, idx) => (
                    <React.Fragment key={`ordertype-${idx}`}>
                      <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                        {p.order_type}
                      </div>
                      <div className="bg-gray-200 text-black p-2 rounded">
                        {p.count} orders — {p.total}
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Sales by Order Source */}
                  {reportData.sales_by_order_source?.map((p, idx) => (
                    <React.Fragment key={`ordersrc-${idx}`}>
                      <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                        {p.source}
                      </div>
                      <div className="bg-gray-200 text-black p-2 rounded">
                        {p.count} orders — {p.total}
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Most Selling Item */}
                  {reportData.most_selling_item?.item_name && (
                    <>
                      <div className="bg-gray-100 text-[#D987EF] font-semibold p-2 rounded">
                        Most Selling Item
                      </div>
                      <div className="bg-gray-200 text-black p-2 rounded">
                        {reportData.most_selling_item.item_name} —{" "}
                        {reportData.most_selling_item.quantity_sold} sold (
                        {reportData.most_selling_item.total_sales})
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-2">
                {reportData?.sales_growth_percentage !== undefined && (
                  <SalesGrowthPieChart
                    growthPercentage={reportData.sales_growth_percentage}
                  />
                )}
                <DistributionPieCharts
                  data={reportData?.sales_by_payment_type}
                  title="Payment Methods"
                  colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]}
                />
                <DistributionPieCharts
                  data={reportData?.sales_by_order_type}
                  title="Order Types"
                  colors={["#6C5CE7", "#A29BFE", "#FD79A8"]}
                />
                <DistributionPieCharts
                  data={reportData?.sales_by_order_source}
                  title="Order Sources"
                  colors={["#00B894", "#00CEC9", "#74B9FF"]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen p-4">
      {/* <div className="grid grid-cols-1 place-items-center">
        <h1
          className="text-lg lg:text-3xl font-bold mb-4 bg-black text-white p-5 text-center inline-block px-12 lg:px-32"
          style={{
            fontFamily: "Bambino",
            fontWeight: 650,
            borderRadius: "20px",
          }}
        >
          Admin Settings
        </h1>
      </div> */}

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-black rounded-lg p-1 w-[80rem]">
          <button
            onClick={() => setActiveTab("website")}
            className={`flex-1 px-4 py-3 rounded-md text-md lg:text-lg transition-all ${
              activeTab === "website"
                ? "bg-[#EBEBEB] text-black shadow-md"
                : "text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Website Settings
          </button>
          <button
            onClick={() => setActiveTab("drivers")}
            className={`flex-1 px-4 py-3 rounded-md text-md lg:text-lg transition-all ${
              activeTab === "drivers"
                ? "bg-[#EBEBEB] text-black shadow-md"
                : "text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Driver Settings
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 px-4 py-3 rounded-md text-md lg:text-lg transition-all ${
              activeTab === "reports"
                ? "bg-[#EBEBEB] text-black shadow-md"
                : "text-white "
            }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-10">
        {activeTab === "website" && renderWebsiteSettings()}
        {activeTab === "drivers" && renderDriverSettings()}
        {activeTab === "reports" && renderReports()}
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
    </div>
  );
}

export default AdminHome;
