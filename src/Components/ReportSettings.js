import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import SalesGrowthPieChart from "./SalesGrowthPieChart";
import DistributionPieCharts from "./DistributionPieCharts";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { colors } from "../colors";
import logo from "../images/tvpLogo.png";

// Helper to get current week number
const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
};

// Helper to get month name
const getMonthName = (monthIndex) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[monthIndex];
};


function ReportSettings() {
  const [reportData, setReportData] = useState(null);
  const [showPostalCodesTable, setShowPostalCodesTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW
  const [activeReport, setActiveReport] = useState("today"); // "today", "daily2", "weekly2", "monthly2"

  // State for daily2 report
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // State for weekly2 report
  // State for weekly2 report
  const [selectedWeekDate, setSelectedWeekDate] = useState(new Date().toISOString().slice(0, 10));

  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));

  // State for monthly2 report
  const [selectedYearMonth, setSelectedYearMonth] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed

  // State for frontend filtering
  const [filterSource, setFilterSource] = useState("All");
  const [filterPaymentType, setFilterPaymentType] = useState("All");
  const [filterOrderType, setFilterOrderType] = useState("All");

  const [uniqueSources, setUniqueSources] = useState([]);
  const [uniquePaymentTypes, setUniquePaymentTypes] = useState([]);
  const [uniqueOrderTypes, setUniqueOrderTypes] = useState([]);

  const [driverReportData, setDriverReportData] = useState([]);

  // State for controlling items table visibility
  const [showItemsTable, setShowItemsTable] = useState(false);

  const [filterItemType, setFilterItemType] = useState("All");
  const [uniqueItemTypes, setUniqueItemTypes] = useState([]);

  const prepareChartsForPDF = () => {
    const chartContainer = document.getElementById("chart-container");
    chartContainer.innerHTML = ""; // Clear any previous charts

    const charts = document.querySelectorAll("canvas");
    charts.forEach((chart) => {
      const cloned = chart.cloneNode(true);
      cloned.style.marginBottom = "16px";
      chartContainer.appendChild(cloned);
    });
  };

  const pdfRef = useRef();

  const generatePDF = async () => {
    prepareChartsForPDF();

    const input = pdfRef.current;
    input.style.display = "block"; // Temporarily show the hidden PDF layout

    await new Promise((res) => setTimeout(res, 500)); // wait for charts/images to render

    const canvas = await html2canvas(input, {
      scale: 1.5, // Reduced from 2 to 1.5 for better performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content exceeds one page
    while (heightLeft > 20) { // Changed from >= 0 to > 20 to avoid extra pages
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Sales_Report.pdf");
    input.style.display = "none"; // Hide again
  };




  const fetchReport = async (type) => {
    setActiveReport(type);
    setIsLoading(true); // NEW
    setReportData(null);


    setFilterItemType("All");


    let url = `/admin/sales-report/`;

    try {
      if (type === "today") {
        url += "today";
      } else if (type === "daily2") {
        if (!selectedDate) {
          alert("Please select a date for the daily report.");
          return;
        }
        url += `daily2/${selectedDate}`;
      } else if (type === "weekly2") {
        if (!selectedWeekDate) {
          alert("Please select a date for the weekly report.");
          return;
        }
        url += `weekly2/${selectedWeekDate}`;
      } else if (type === "monthly2") {
        if (!selectedYearMonth || !selectedMonth) {
          alert("Please select a year and month for the monthly report.");
          return;
        }
        url += `monthly2/${selectedYearMonth}/${selectedMonth}`;
      } else if (type === "driver") {
        setActiveReport("driver");
        setIsLoading(true);
        setReportData(null);
        try {
          const res = await axiosInstance.get(`/admin//driver-report/${selectedDate}`);
          setDriverReportData(res.data);
        } catch (err) {
          console.error("Error fetching driver report:", err);
          alert("Failed to fetch driver report.");
        } finally {
          setIsLoading(false);
        }
        return; // Skip the rest of the report fetch logic
      }
      else {
        // Fallback for old weekly/monthly if desired, though new ones are preferred
        url += type;
      }

      const params = {};
      if (filterSource !== 'All') params.source = filterSource;
      if (filterPaymentType !== 'All') params.payment = filterPaymentType;
      if (filterOrderType !== 'All') params.orderType = filterOrderType;

      const res = await axiosInstance.get(url, { params });
      setReportData(res.data);
      console.log("REPORT DATA:", res.data);

      // Populate unique filter options from fetched data
      if (filterSource === "All" && filterPaymentType === "All" && filterOrderType === "All") {
        if (res.data.sales_by_order_source) {
          setUniqueSources(['All', ...new Set(res.data.sales_by_order_source.map(s => s.source))]);
        }
        if (res.data.sales_by_payment_type) {
          setUniquePaymentTypes(["All", ...new Set(res.data.sales_by_payment_type.map(p => p.payment_type))]);
        }
        if (res.data.sales_by_order_type) {
          setUniqueOrderTypes(["All", ...new Set(res.data.sales_by_order_type.map(o => o.order_type))]);
        }

        if (res.data.all_items_sold) {
          const uniqueTypes = ['All', ...new Set(res.data.all_items_sold.map(item => item.type).filter(Boolean))];
          setUniqueItemTypes(uniqueTypes);
        }
      }

    } catch (err) {
      console.error(`Error fetching ${type} report:`, err);
      alert(`Failed to fetch ${type} report. Please check your selections.`);
    } finally {
      setIsLoading(false); // NEW
    }

  };

  useEffect(() => {
    if (activeReport) {
      fetchReport(activeReport);
    }
  }, [activeReport, filterSource, filterPaymentType, filterOrderType]);


  // Filtered data for charts
  const getFilteredData = (data, filterKey, filterValue) => {
    if (!data || filterValue === "All") {
      return data;
    }
    return data.filter(item => item[filterKey] === filterValue);
  };

  // Add these new filtered data variables after the existing ones
  const filteredPaymentDataPOS = getFilteredData(reportData?.sales_by_payment_type_pos, 'payment_type', filterPaymentType);
  const filteredPaymentDataWebsite = getFilteredData(reportData?.sales_by_payment_type_website, 'payment_type', filterPaymentType);
  const filteredOrderTypeDataPOS = getFilteredData(reportData?.sales_by_order_type_pos, 'order_type', filterOrderType);
  const filteredOrderTypeDataWebsite = getFilteredData(reportData?.sales_by_order_type_website, 'order_type', filterOrderType);

  const filteredPaymentData = getFilteredData(reportData?.sales_by_payment_type, 'payment_type', filterPaymentType);
  const filteredOrderTypeData = getFilteredData(reportData?.sales_by_order_type, 'order_type', filterOrderType);
  const filteredOrderSourceData = getFilteredData(reportData?.sales_by_order_source, 'source', filterSource);


  return (
    <div className="space-y-8">
      {/* Report Type Buttons */}
      <div className="flex justify-start gap-3 mx-auto w-full max-w-[90rem] px-4 overflow-x-auto sm:flex-wrap sm:justify-center no-scrollbar">
        {["today", "daily2", "weekly2", "monthly2", "driver"].map((type) => (
          <button
            key={type}
            onClick={() => fetchReport(type)}
            className={`px-5 py-2 flex-shrink-0 rounded text-sm sm:text-lg lg:text-xl transition-colors duration-200 ${activeReport === type
              ? "bg-[#EBEBEB] text-black"
              : "bg-black text-white"
              }`}
            style={{
              fontFamily: "Bambino",
              fontWeight: 550,
            }}
          >
            {type === "today" && "Today's Report"}
            {type === "daily2" && "Daily Report"}
            {type === "weekly2" && "Weekly Report"}
            {type === "monthly2" && "Monthly Report"}
            {type === "driver" && "Drivers Report"}
          </button>
        ))}
      </div>




      {/* Date/Period Selection Inputs */}
      {activeReport != 'today' && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mx-auto w-full max-w-[60rem] mt-2 px-4">
          {activeReport === "daily2" && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
              <label htmlFor="dailyDate" className="font-semibold" style={{ fontFamily: "Bambino" }}>
                Select Date:
              </label>
              <input
                type="date"
                id="dailyDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border rounded w-full sm:w-auto"
              />
              <div className="flex flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => fetchReport("daily2")}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Get Report
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {activeReport === "driver" && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
              <label htmlFor="driverDate" className="font-semibold" style={{ fontFamily: "Bambino" }}>
                Select Date:
              </label>
              <input
                type="date"
                id="driverDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border rounded w-full sm:w-auto"
              />
              <div className="flex flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => fetchReport("driver")}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Get Report
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {activeReport === "weekly2" && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
              <label htmlFor="weeklyDate" className="font-semibold" style={{ fontFamily: "Bambino" }}>
                Select Date:
              </label>
              <input
                type="date"
                id="weeklyDate"
                value={selectedWeekDate}
                onChange={(e) => setSelectedWeekDate(e.target.value)}
                className="p-2 border rounded w-full sm:w-auto"
              />
              <div className="flex flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => fetchReport("weekly2")}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Get Report
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}


          {activeReport === "monthly2" && (
            <div className="flex flex-col sm:flex-row items-center justify-center  gap-2 w-full">
              <label htmlFor="monthlyYear" className="font-semibold" style={{ fontFamily: "Bambino" }}>
                Year:
              </label>
              <input
                type="number"
                id="monthlyYear"
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(parseInt(e.target.value))}
                className="p-2 border rounded w-full sm:w-24"
              />
              <label htmlFor="monthlyMonth" className="font-semibold" style={{ fontFamily: "Bambino" }}>
                Month:
              </label>
              <select
                id="monthlyMonth"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="p-2 border rounded w-full sm:w-auto"
              >
                {[...Array(12).keys()].map(i => (
                  <option key={i} value={i + 1}>{getMonthName(i)}</option>
                ))}
              </select>
              <div className="flex flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => fetchReport("monthly2")}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Get Report
                </button>
                <button
                  onClick={generatePDF}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {isLoading && (
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
          <span className="text-base font-medium" style={{ fontFamily: "Bambino" }}>
            Loading report...
          </span>
        </div>
      )}
      {activeReport === "driver" && driverReportData?.driver_delivery_locations && (
        <div className="mx-4 lg:mx-24 bg-white border rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Driver Delivery Locations</h2>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Driver Name</th>
                <th className="border p-2">Street Address</th>
                <th className="border p-2">City</th>
                <th className="border p-2">County</th>
              </tr>
            </thead>
            <tbody>
              {driverReportData.driver_delivery_locations.map((loc, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{loc.driver_name}</td>
                  <td className="border p-2">{loc.street_address}</td>
                  <td className="border p-2">{loc.city}</td>
                  <td className="border p-2">{loc.postal_code || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === "driver" && driverReportData?.driver_order_summary && (
        <div className="mx-4 lg:mx-24 bg-white border rounded-lg p-4 shadow-lg mt-6">
          <h2 className="text-xl font-bold mb-4">Driver Order Summary</h2>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Driver Name</th>
                <th className="border p-2">Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {driverReportData.driver_order_summary.map((summary, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{summary.driver_name}</td>
                  <td className="border p-2">{summary.total_orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}





      {/* Report Data Display */}
      {reportData && (
        <div className="mx-4 lg:mx-24 bg-white border rounded-lg p-2 shadow-lg items-center">
          <div className="text-sm md:text-lg font-bold mb-6 text-white bg-black rounded-lg w-fit mx-auto px-6 py-2">
            {activeReport === "today" ? "Today's Report" :
              activeReport === "daily2" ? "Daily Report" :
                activeReport === "weekly2" ? "Weekly Report" :
                  "Monthly Report"}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 mb-4 " style={{ fontFamily: "Bambino" }}>
            <div className="col-span-1 w-full px-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="col-span-1">
                  <label className="block text-left pr-2">Source:</label>
                </div>

                <div className="col-span-2">
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full p-0 md:p-2 border rounded"
                  >
                    {uniqueSources.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-span-1 w-full px-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="col-span-1">
                  <label className="block text-left pr-2">Payment Type:</label>
                </div>

                <div className="col-span-2">
                  <select
                    value={filterPaymentType}
                    onChange={(e) => setFilterPaymentType(e.target.value)}
                    className="w-full p-0 md:p-2 border rounded"
                  >
                    {uniquePaymentTypes.map(option => {
                      let label;
                      if (option === '') {
                        label = 'Unpaid';
                      } else if (option === 'card') {
                        label = 'Card-POS';
                      } else if (option === 'Card') {
                        label = 'Card-Website';
                      } else if (option === 'cash') {
                        label = 'Cash';
                      } else {
                        label = option;
                      }

                      return (
                        <option key={option || 'unpaid'} value={option}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>
            </div>
            <div className="col-span-1 w-full px-3">
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="col-span-1">
                  <label className="block text-left pr-2">Order Type:</label>
                </div>

                <div className="col-span-2">
                  <select
                    value={filterOrderType}
                    onChange={(e) => setFilterOrderType(e.target.value)}
                    className="w-full p-0 md:p-2 border rounded"
                  >
                    {uniqueOrderTypes.map(option => (
                      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Details */}
            <div className="lg:col-span-1">
              <div
                className="text-xs md:text-base space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner"
                style={{ fontFamily: "Bambino" }}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Summary</h3>

                {/* Period */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-[#D987EF] font-semibold">Period:</div>
                  <div className="text-black">
                    {reportData.date
                      ? new Date(reportData.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                      : reportData.period
                        ? `${new Date(reportData.period.from).toLocaleDateString("en-GB").replace(/\//g, "-")} → ${new Date(reportData.period.to).toLocaleDateString("en-GB").replace(/\//g, "-")}`
                        : "N/A"}
                  </div>
                </div>



                {/* {activeReport != 'monthly2' && (<div className="grid grid-cols-2 gap-2 items-center">
                  <div className="text-[#D987EF] font-semibold">Total Sales Amount AFTER DISCOUNT:</div>
                  <div className="text-black text-lg font-bold">
                    £{reportData.total_sales_amount || reportData.total_sales}
                  </div>
                </div>)} */}




                {/* Total Orders Placed (New API only) */}
                {reportData.total_orders_placed !== undefined && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Total Orders Placed:</div>
                    <div className="text-black">
                      {reportData.total_orders_placed}
                    </div>
                  </div>
                )}

                {/* Sales Growth Percentage (Only for daily reports) */}
                {reportData.sales_growth_percentage !== undefined && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Sales Growth (vs. Last Week):</div>
                    <div className={`font-bold ${reportData.sales_growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.sales_growth_percentage > 0 ? '+' : ''}{reportData.sales_growth_percentage}%
                    </div>
                  </div>
                )}

                {reportData.sales_increase !== undefined && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Sales Growth (vs. Last Week):</div>
                    <div className={`font-bold ${reportData.sales_increase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      £{reportData.sales_increase > 0 ? '+' : ''}{reportData.sales_increase}
                    </div>
                  </div>
                )}

                {/* Most Sold Item */}
                {(reportData.most_selling_item?.item_name || reportData.most_sold_item?.item_name) && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Most Sold Item:</div>
                    <div className="text-black">
                      {reportData.most_selling_item?.item_name || reportData.most_sold_item?.item_name}
                      {" "}
                      ({reportData.most_selling_item?.quantity_sold || reportData.most_sold_item?.quantity_sold} sold)
                    </div>
                  </div>
                )}

                {/* Most Sold Type (New API only) */}
                {/* Most Sold Type (New API only) */}
                {reportData.most_sold_type?.type && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Most Sold Category:</div>
                    <div className="text-black">
                      {reportData.most_sold_type.type}
                      {" "}
                      ({reportData.most_sold_type.quantity_sold} sold)
                    </div>
                  </div>
                )}

                {/* Most Delivered Postal Code */}
                {reportData.most_delivered_postal_code && (
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="text-[#D987EF] font-semibold">Most Delivered Area:</div>
                    <div className="text-black">
                      {reportData.most_delivered_postal_code.postal_code}
                      {" "}
                      ({reportData.most_delivered_postal_code.delivery_count} deliveries)
                    </div>
                  </div>
                )}
                {reportData.paidouts && reportData.paidouts.length > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-4 mt-4">
                      <h4 className="text-lg font-bold text-gray-800 mb-3">Payouts</h4>
                      <div className="space-y-2">
                        {reportData.paidouts.map((payout, index) => (
                          <div key={payout.id || index} className="grid grid-cols-2 gap-2 items-center">
                            <div className="text-[#D987EF] font-semibold">{payout.label}:</div>
                            <div className="text-black font-medium">
                              £{payout.amount}
                            </div>
                          </div>
                        ))}
                        {/* Total paidouts */}

                      </div>
                    </div>
                  </>
                )}
                {reportData && (
                  <>
                    <div className="border-t border-gray-300 pt-4 mt-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">Sales Details</h4>
                        {/* Total paidouts */
                          (activeReport == 'monthly2' || activeReport == 'weekly2') && (
                            <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                              <div className="text-[#D987EF] font-bold">Total Sales:</div>
                              <div className="text-black text-lg font-bold">
                                £{reportData.whole_month_discount && reportData.whole_month_discount.length > 0 ? (
                                  
                                  parseFloat(reportData.total_sales_amount || reportData.total_sales) +
                                  parseFloat(reportData?.whole_month_discount[0]?.sum || 0)
                                ).toFixed(2) : parseFloat(reportData.total_sales_amount || reportData.total_sales).toFixed(2)}
                              </div>
                            </div>)}

                        {
                          (activeReport == 'daily2' || activeReport == 'today') && (
                            <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                              <div className="text-[#D987EF] font-bold">Total Sales:</div>
                              <div className="text-black text-lg font-bold">
                                £{reportData.total_discount !== undefined > 0 ? (
                                  parseFloat(reportData.total_sales_amount || reportData.total_sales) +
                                  parseFloat(Number(reportData.total_discount).toFixed(2))
                                ).toFixed(2) : parseFloat(reportData.total_sales_amount || reportData.total_sales).toFixed(2)}
                              </div>
                            </div>)}

                        {reportData.total_discount !== undefined && (
                          <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                            <div className="text-[#D987EF] font-semibold">Total Discount:</div>
                            <div className="text-black text-lg font-bold">
                              £{Number(reportData.total_discount).toFixed(2)}
                            </div>
                          </div>
                        )}

                        {reportData.whole_month_discount && reportData.whole_month_discount.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                            <div className="text-[#D987EF] font-bold">Total Discount:</div>
                            <div className="text-black text-lg font-bold">
                              £{reportData.whole_month_discount[0].sum != null ? parseFloat(reportData?.whole_month_discount[0]?.sum).toFixed(2) : 0.00}
                            </div>
                          </div>)}

                        {reportData.whole_month_paidouts && reportData.whole_month_paidouts.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 items-center  pt-2 mt-2">
                            <div className="text-[#D987EF] font-bold">Total Paidouts:</div>
                            <div className="text-black text-lg font-bold">
                              £{parseFloat(reportData?.whole_month_paidouts[0]?.sum).toFixed(2)}
                            </div>
                          </div>)}

                        {reportData.paidouts && reportData.paidouts.length > 0 && (

                          <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                            <div className="text-[#D987EF] font-bold">Total Payouts:</div>
                            <div className="text-black text-lg font-bold">
                              £{reportData.paidouts.reduce((sum, payout) => sum + parseFloat(payout.amount), 0).toFixed(2)}
                            </div>
                          </div>
                        )}

                        {(activeReport == 'monthly2' || activeReport == 'weekly2') && (
                          <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                            <div className="text-[#D987EF] font-bold">Total Sales after Paidouts and Discounts:</div>
                            <div className="text-black text-lg font-bold">
                              £{reportData.whole_month_paidouts && reportData.whole_month_paidouts.length > 0?(
                                parseFloat(reportData.total_sales_amount || reportData.total_sales) -
                                parseFloat(reportData?.whole_month_paidouts[0]?.sum)
                              ).toFixed(2):0}
                            </div>
                          </div>)}

                        {(activeReport == 'daily2' || activeReport == 'today') && (
                          <div className="grid grid-cols-2 gap-2 items-center pt-2 mt-2">
                            <div className="text-[#D987EF] font-bold">Total Sales after Paidouts and Discounts:</div>
                            <div className="text-black text-lg font-bold">
                              £{(
                                parseFloat(reportData.total_sales_amount || reportData.total_sales) -
                                (reportData.paidouts?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        )}




                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="col-span-1 lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {reportData?.sales_increase !== undefined && (
                  <SalesGrowthPieChart growthPercentage={reportData.sales_increase} period={activeReport} />
                )}

                <DistributionPieCharts data={filteredPaymentData} title="Payment Methods" />
                <DistributionPieCharts data={filteredOrderTypeData} title="Order Types" />
                <DistributionPieCharts data={filteredOrderSourceData} title="Order Sources" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {filteredPaymentDataPOS && (<DistributionPieCharts data={filteredPaymentDataPOS} title="Payment Methods (POS)" />)}
                {filteredOrderTypeDataPOS && (<DistributionPieCharts data={filteredOrderTypeDataPOS} title="Order Types (POS)" />)}
                {filteredPaymentDataWebsite && (<DistributionPieCharts data={filteredPaymentDataWebsite} title="Payment Methods (WEB)" />)}

                {filteredOrderTypeDataWebsite && (<DistributionPieCharts data={filteredOrderTypeDataWebsite} title="Order Types (WEB)" />)}
              </div>
            </div>

          </div>

          {reportData.deliveries_by_postal_code && reportData.deliveries_by_postal_code.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "Bambino" }}>
                  Deliveries by Postal Code ({reportData.deliveries_by_postal_code.length} locations)
                </h3>
                <button
                  onClick={() => setShowPostalCodesTable(!showPostalCodesTable)}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ fontFamily: "Bambino" }}
                >
                  {showPostalCodesTable ? 'Hide Postal Codes' : 'Show Postal Codes'}
                </button>
              </div>
              {showPostalCodesTable && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-gray-100" style={{ fontFamily: "Bambino" }}>
                        <th className="border p-3 font-semibold">Postal Code</th>
                        <th className="border p-3 font-semibold">Delivery Count</th>
                        <th className="border p-3 font-semibold">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontFamily: "Bambino" }}>
                      {reportData.deliveries_by_postal_code.map((location, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border p-3 font-medium">{location.postal_code}</td>
                          <td className="border p-3 text-center font-semibold">{location.delivery_count}</td>
                          <td className="border p-3 text-right font-semibold">£{parseFloat(location.total_delivery_sales).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {reportData.all_items_sold && reportData.all_items_sold.length > 0 && (() => {
            // Create filtered items array
            const filteredItems = filterItemType === "All"
              ? reportData.all_items_sold
              : reportData.all_items_sold.filter(item => item.type === filterItemType);

            return (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "Bambino" }}>
                    All Items Sold ({filteredItems.length} items)
                  </h3>
                  <button
                    onClick={() => setShowItemsTable(!showItemsTable)}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors"
                    style={{ fontFamily: "Bambino" }}
                  >
                    {showItemsTable ? 'Hide Items' : 'Show Items'}
                  </button>
                </div>

                {/* Filter by Item Type */}
                {showItemsTable && (
                  <div className="mb-4" style={{ fontFamily: "Bambino" }}>
                    <label className="mr-5 font-semibold">Filter by Type:</label>
                    <select
                      value={filterItemType}
                      onChange={(e) => setFilterItemType(e.target.value)}
                      className="p-2 border rounded w-48"
                    >
                      {uniqueItemTypes.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}

                {showItemsTable && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-gray-100" style={{ fontFamily: "Bambino" }}>
                          <th className="border p-3 font-semibold">Item Name</th>
                          <th className="border p-3 font-semibold">Type</th>
                          {/* <th className="border p-3 font-semibold">Subtype</th> */}
                          <th className="border p-3 font-semibold">Qty Sold</th>
                          {/* <th className="border p-3 font-semibold">Avg Price</th> */}
                          {/* <th className="border p-3 font-semibold">Min Price</th> */}
                          {/* <th className="border p-3 font-semibold">Max Price</th> */}
                          <th className="border p-3 font-semibold">Total Sales</th>
                          <th className="border p-3 font-semibold">Orders</th>
                          {reportData.all_items_sold[0]?.percentage_of_total_sales !== undefined && (
                            <th className="border p-3 font-semibold">% of Total</th>
                          )}
                        </tr>
                      </thead>
                      <tbody style={{ fontFamily: "Bambino" }}>
                        {filteredItems.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border p-3 font-medium">{item.item_name}</td>
                            <td className="border p-3">{item.type || 'N/A'}</td>
                            {/* <td className="border p-3">{item.subtype || 'N/A'}</td> */}
                            <td className="border p-3 text-center font-semibold">{item.total_quantity_sold}</td>
                            {/* <td className="border p-3 text-right">${parseFloat(item.average_unit_price).toFixed(2)}</td> */}
                            {/* <td className="border p-3 text-right">${parseFloat(item.min_unit_price).toFixed(2)}</td> */}
                            {/* <td className="border p-3 text-right">${parseFloat(item.max_unit_price).toFixed(2)}</td> */}
                            <td className="border p-3 text-right font-semibold">£{parseFloat(item.total_item_sales).toFixed(2)}</td>
                            <td className="border p-3 text-center">{item.orders_containing_item}</td>
                            {item.percentage_of_total_sales !== undefined && (
                              <td className="border p-3 text-center">{item.percentage_of_total_sales}%</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      )}
      <div
        ref={pdfRef}
        id="pdf-content"
        style={{
          width: "210mm",
          maxWidth: "210mm",
          minHeight: "auto", // Changed from "297mm" to "auto"
          padding: "15mm", // Reduced padding from 20mm to 15mm
          backgroundColor: "#fff",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          display: "none",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
            {activeReport === "today"
              ? "Today's Report"
              : activeReport === "daily2"
                ? "Daily Report"
                : activeReport === "weekly2"
                  ? "Weekly Report"
                  : "Monthly Report"}
          </h1>
          <img style={{ height: "64px", width: "auto" }} src={logo} alt="Logo" />
        </div>

        {/* Summary Section */}
        {reportData && (
          <div style={{ marginBottom: "30px" }}>

            <p style={{ margin: "5px 0" }}>
              <strong>Date:</strong>{" "}
              {reportData.date
                ? new Date(reportData.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                : reportData.period
                  ? `${new Date(reportData.period.from).toLocaleDateString("en-GB").replace(/\//g, "-")} - ${new Date(reportData.period.to).toLocaleDateString("en-GB").replace(/\//g, "-")}`
                  : "N/A"}
            </p>


            <p style={{ margin: "5px 0" }}>
              <strong>Total Sales Amount (After Discount):</strong> £{reportData.total_sales || reportData.total_sales_amount}
            </p>

            {reportData.total_discount !== undefined && (
              <p style={{ margin: "5px 0" }}>
                <strong>Total Discount:</strong> £{reportData.total_discount.toFixed(2)}
              </p>
            )}

            {reportData.sales_increase !== undefined && (
              <p style={{ margin: "5px 0" }}>
                <strong>Sales Growth:</strong> £{reportData.sales_increase}
              </p>
            )}

            {/* Sales by Payment Type */}
            {reportData.sales_by_payment_type && reportData.sales_by_payment_type.length > 0 && (
              <div>
                <p style={{ margin: "15px 0 5px 0" }}><strong>Sales by Payment Type:</strong></p>
                {reportData.sales_by_payment_type.map((payment, index) => (
                  <p key={index} style={{ margin: "2px 0 2px 20px" }}>
                    {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}: £{payment.total} ({payment.count} {payment.count === "1" ? "transaction" : "transactions"})
                  </p>
                ))}
              </div>
            )}

            {/* Sales by Order Type */}
            {reportData.sales_by_order_type && reportData.sales_by_order_type.length > 0 && (
              <div>
                <p style={{ margin: "15px 0 5px 0" }}><strong>Sales by Order Type:</strong></p>
                {reportData.sales_by_order_type.map((order, index) => (
                  <p key={index} style={{ margin: "2px 0 2px 20px" }}>
                    {order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1)}: £{order.total} ({order.count} {order.count === "1" ? "order" : "orders"})
                  </p>
                ))}
              </div>
            )}

            {/* Sales by Order Source */}
            {reportData.sales_by_order_source && reportData.sales_by_order_source.length > 0 && (
              <div>
                <p style={{ margin: "15px 0 5px 0" }}><strong>Sales by Order Source:</strong></p>
                {reportData.sales_by_order_source.map((source, index) => (
                  <p key={index} style={{ margin: "2px 0 2px 20px" }}>
                    {source.source}: £{source.total} ({source.count} {source.count === "1" ? "order" : "orders"})
                  </p>
                ))}
              </div>
            )}

            {/* Additional Stats */}
            {reportData.most_selling_item?.item_name && (
              <p style={{ margin: "15px 0 5px 0" }}>
                <strong>Most Selling Item:</strong> {reportData.most_selling_item.item_name} ({reportData.most_selling_item.quantity_sold} sold) - £{reportData.most_selling_item.total_sales}
              </p>
            )}

            {reportData.most_delivered_postal_code?.postal_code && (
              <p style={{ margin: "5px 0" }}>
                <strong>Most Delivered Area:</strong> {reportData.most_delivered_postal_code.postal_code} ({reportData.most_delivered_postal_code.delivery_count} deliveries) - £{reportData.most_delivered_postal_code.total_delivery_sales}
              </p>
            )}
          </div>
        )}

        {/* Dashboards Section */}
        <div id="dashboard-section" style={{ marginBottom: "20px" }}>
          <div id="chart-container" />
        </div>

        {/* Items Table */}
        {/* {reportData?.all_items_sold?.length > 0 && (
          <div>
            <h2 style={{ margin: "0 0 15px 0", fontSize: "20px", fontWeight: "bold" }}>
              All Items Sold
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={{ fontSize: "14px", border: "1px solid #000", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Item Name</th>
                  <th style={{ fontSize: "14px", border: "1px solid #000", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Type</th>
                  <th style={{ fontSize: "14px", border: "1px solid #000", padding: "8px", fontWeight: "bold", textAlign: "center" }}>Qty Sold</th>
                  <th style={{ fontSize: "14px", border: "1px solid #000", padding: "8px", fontWeight: "bold", textAlign: "right" }}>Total Sales</th>
                  <th style={{ fontSize: "14px", border: "1px solid #000", padding: "8px", fontWeight: "bold", textAlign: "center" }}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {reportData.all_items_sold.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>{item.item_name}</td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>{item.type || "N/A"}</td>
                    <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{item.total_quantity_sold}</td>
                    <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>£{parseFloat(item.total_item_sales).toFixed(2)}</td>
                    <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{item.orders_containing_item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
      </div>


    </div>
  );
}

export default ReportSettings;