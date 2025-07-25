import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import TakeAway from "../images/TakeAway.png";
import Delivery from "../images/Delivery.png";
import DineIn from "../images/DineIn.png";
import web from "../images/web.png";
import home from "../images/home.png";
import More from "../images/More.png";
import TakeAwayWhite from "../images/TakeAwaywhite.png";
import DeliveryWhite from "../images/Deliverywhite.png";
import DineInWhite from "../images/DineInwhite.png";
import WebsiteWhite from "../images/webwhite.png";
import SettingsModal from "./SettingsModal";
// At the top of AdminNavBar.js
import { useSelector } from "react-redux";

function AdminNavBar() {
  const location = useLocation();
  const offers = useSelector((state) => state.offers.list);

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const moreRef = useRef();

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavBarTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 750,
  };

  const NavBarTextStyleHover = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 750,
    textDecoration: "underline",
    textDecorationColor: "#AA1B17",
    textDecorationThickness: "3px",
    textUnderlineOffset: "5px",
    backgroundColor: "#000000",
    borderRadius: "8px",
  };

  return (
    <div
      className="fixed bottom-0 grid grid-cols-6 w-[100%] border-t border-gray-600"
      style={{
        backgroundColor: "#FFFFFF",
        zIndex: "60",
      }}
    >
      <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/takeaway"
          className="nav-link"
          style={
            isActive("/admin/takeaway") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img
            className="h-10 w-auto my-2 px-3"
            src={isActive("/admin/takeaway") ? TakeAwayWhite : TakeAway}
            alt="Take Away"
          />
        </Link>
      </div>

      <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/dinein"
          className="nav-link "
          style={
            isActive("/admin/dinein") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img
            className="h-10 w-auto my-2 px-3"
            src={isActive("/admin/dinein") ? DineInWhite : DineIn}
            alt="Dine In"
          />
        </Link>
      </div>
      <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/delivery"
          className="nav-link "
          style={
            isActive("/admin/delivery") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img
            className="h-10 w-auto my-2 px-3"
            src={isActive("/admin/delivery") ? DeliveryWhite : Delivery}
            alt="Delivery"
          />
        </Link>
      </div>
      <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/web"
          className="nav-link "
          style={
            isActive("/admin/web") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img
            className="h-10 w-auto my-2 px-3"
            src={isActive("/admin/web") ? WebsiteWhite : web}
            alt="web"
          />
        </Link>
      </div>
      <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/home"
          className="nav-link "
          style={
            isActive("/admin/home") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img className="h-10 w-auto my-2 px-3" src={home} alt="home" />
        </Link>
      </div>
      {/* <div className="col-span-1 flex justify-center items-center my-2">
        <Link
          to="/admin/more"
          className="nav-link "
          style={
            isActive("/admin/more") ? NavBarTextStyleHover : NavBarTextStyle
          }
        >
          <img className="h-10 w-auto my-2 px-3" src={More} alt="More" />
        </Link>
      </div> */}
      <div
        ref={moreRef}
        className="col-span-1 flex justify-center items-center my-2 relative"
      >
        <button
          className="focus:outline-none"
          onClick={() => setShowMoreOptions((prev) => !prev)}
          style={NavBarTextStyle}
        >
          <img className="h-10 w-auto my-2 px-3" src={More} alt="More" />
        </button>

        {showMoreOptions && (
          <div className="absolute bottom-14 bg-white shadow-lg rounded-md border border-gray-300 py-2 w-40 text-sm">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => setShowSettingsModal(true)}
            >
              Settings
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Option 2
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Logout
            </button>
          </div>
        )}
      </div>
      {showSettingsModal && (
        <SettingsModal
          // offers={offers}
          // setOffers={setOffers} // You'll need to lift this state up
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default AdminNavBar;
