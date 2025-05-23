import React from "react";
import logo from "../images/sLogo.png";

import { Link, useLocation } from "react-router-dom";

import TakeAway from "../images/TakeAway.png";
import Delivery from "../images/Delivery.png";
import DineIn from "../images/DineIn.png";

function AdminHome() {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path;
  };
  const NavBarTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
  };

  const NavBarTextStyleHover = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    // textDecoration: "underline",
    // textDecorationColor: "#F2D9F9",
    // textDecorationThickness: "3px",
    // textUnderlineOffset: "5px",
  };

  return (
    <div>
      <div className="flex justify-center items-center w-[100%] my-20">
        <img className="h-32 w-auto" src={logo} alt="Logo" />
      </div>
      <div className="grid grid-cols-3">
        <div className="col-span-1 flex justify-center items-center">
          <Link
            to="/admin/menuT"
            className="nav-link flex flex-col items-center"
            style={
              isActive("/admin/menuT") ? NavBarTextStyleHover : NavBarTextStyle
            }
          >
            <img
              className="h-44 w-auto my-3 px-3"
              src={TakeAway}
              alt="Take Away"
            />
            <p
              className="mt-5 text-4xl px-8 py-2"
              style={{ backgroundColor: "#F2D9F9", borderRadius: "30px" }}
            >
              Take Away
            </p>
          </Link>
        </div>

        <div className="col-span-1 flex justify-center items-center">
          <Link
            to="/admin/menuD"
            className="nav-link flex flex-col items-center"
            style={
              isActive("/admin/menuD") ? NavBarTextStyleHover : NavBarTextStyle
            }
          >
            <img className="h-48 w-auto my-3 px-3" src={DineIn} alt="Dine In" />
            <p
              className="mt-5 text-4xl px-8 py-2"
              style={{ backgroundColor: "#F2D9F9", borderRadius: "30px" }}
            >
              Dine In
            </p>
          </Link>
        </div>

        <div className="col-span-1 flex justify-center items-center">
          <Link
            to="/admin/MenuDe"
            className="nav-link flex flex-col items-center"
            style={
              isActive("/admin/MenuDe") ? NavBarTextStyleHover : NavBarTextStyle
            }
          >
            <img
              className="h-44 w-auto my-3 px-3"
              src={Delivery}
              alt="Delivery"
            />
            <p
              className="mt-5 text-4xl px-8 py-2"
              style={{ backgroundColor: "#F2D9F9", borderRadius: "30px" }}
            >
              Delivery
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
