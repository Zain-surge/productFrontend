import React, { useState } from "react";
import WebsiteSettings from "./WebsiteSettings";
import DriverSettings from "./DriverSettings";
import ReportSettings from "./ReportSettings";

function AdminHome() {
  const [activeTab, setActiveTab] = useState("reports"); // Default to Website Settings

  return (
    <div className="w-full min-h-screen p-4">
      {/* Navigation Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-black rounded-lg p-1 w-[80rem]">
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
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-10">
        {activeTab === "website" && <WebsiteSettings />}
        {activeTab === "drivers" && <DriverSettings />}
        {activeTab === "reports" && <ReportSettings />}
      </div>
    </div>
  );
}

export default AdminHome;