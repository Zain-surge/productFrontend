import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../images/tvpLogo.png";
import cartIcon from "../images/cart.png";
import CartWrapper from "./CartWrapper";
import personIcon from "../images/person.png";
import axiosInstance from "../axiosInstance";
import { clearUser, setUser } from "../store/userSlice";
import { clearCart } from "../store/cartSlice";
import { openAuthModal } from "../store/modalSlice";
import { colors } from "../colors";

function NavBar() {
  const totalItems = useSelector((state) => state.cart.items.length);
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);
  const showAuthModal = useSelector((state) => state.modal.showAuthModal);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();

  useEffect(() => {
    axiosInstance
      .get("/auth/check-session", {
        withCredentials: true,
      })
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      console.log("LOGGING OUT");
      await saveCartItems();
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      dispatch(clearUser());
      dispatch(clearCart());
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const saveCartItems = async () => {
    if (cartItems.length > 0 && user) {
      try {
        console.log(cartItems);
        await axiosInstance.post(
          "/cart/saveCart",
          {
            userId: user.id,
            cartItems: cartItems,
          },
          { withCredentials: true }
        );
        console.log("Cart items saved successfully.");
      } catch (error) {
        console.error("Error saving cart items:", error);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (cartItems.length > 0 && user) {
        event.preventDefault();
        await saveCartItems();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [cartItems, user]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavBarTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 750,
  };

  const NavBarTextStyleDesktop = {
    fontFamily: "Bambino",
    fontWeight: 750,
    textDecoration: "none",
  };

  const NavBarTextStyleHoverDesktop = {
    fontFamily: "Bambino",
    fontWeight: 750,
    textDecoration: "underline",
    textDecorationColor: colors.primaryRed,
    textDecorationThickness: "3px",
    textUnderlineOffset: "5px",
  };

  return (
    <div>
      {/* Desktop Navigation - Top */}
      <nav
        className="hidden lg:block fixed top-0 w-full bg-white"
        style={{ zIndex: 45 }}
      >
        <div className="flex items-center justify-between h-20 px-8">
          <div className="flex items-center">
            <Link to="/">
              <img className="h-12 w-auto" src={logo} alt="Logo" />
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="nav-link py-1 px-4 text-sm"
              style={
                isActive("/")
                  ? NavBarTextStyleHoverDesktop
                  : NavBarTextStyleDesktop
              }
            >
              MENU
            </Link>
            <Link
              to="/contact"
              className="nav-link py-1 px-4 text-sm"
              style={
                isActive("/contact")
                  ? NavBarTextStyleHoverDesktop
                  : NavBarTextStyleDesktop
              }
            >
              CONTACT US
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img
                  className="h-8 w-auto"
                  src={personIcon}
                  alt="Person Icon"
                />
              </button>
              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg "
                  style={{ zIndex: 100 }}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700">
                        {user.email}
                      </div>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => dispatch(openAuthModal())}
                      >
                        Edit Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => dispatch(openAuthModal())}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section - Menu and Contact */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex flex-col items-center justify-center">
              <div
                className={`w-6 h-6 flex items-center justify-center mb-1`}
                style={{ color: isActive("/") ? colors.primary : "#4B5563" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <span
                className={`text-xs `}
                style={{
                  ...NavBarTextStyle,
                  color: isActive("/") ? colors.primary : "#4B5563", // gray-600 fallback
                }}
              >
                MENU
              </span>
            </Link>

            <Link
              to="/contact"
              className="flex flex-col items-center justify-center"
            >
              <div
                className={`w-6 h-6 flex items-center justify-center mb-1 `}
                style={{
                  color: isActive("/contact") ? colors.primary : "#4B5563", // gray-600 fallback
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <span
                className={`text-xs `}
                style={{
                  ...NavBarTextStyle,
                  color: isActive("/contact") ? colors.primary : "#4B5563", // gray-600 fallback
                }}
              >
                CONTACT
              </span>
            </Link>
          </div>

          {/* Center Section - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
            <Link to="/" className="flex items-center justify-center">
              <div className="relative">
                {/* Green Circle Background */}
                <div
                  className="absolute inset-0 w-16 h-16  rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 shadow-lg"
                  style={{ backgroundColor: colors.primaryGreen }}
                ></div>
                {/* Logo */}
                <img
                  className="relative h-10 w-auto z-10"
                  src={logo}
                  alt="Logo"
                />
              </div>
            </Link>
          </div>

          {/* Right Section - Cart and Login */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center justify-center"
              >
                <div className="relative w-6 h-6 flex items-center justify-center mb-1 text-gray-600">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-2 -right-2  text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: colors.primaryRed }}
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600" style={NavBarTextStyle}>
                  CART
                </span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1 text-gray-600">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600" style={NavBarTextStyle}>
                  {user ? "PROFILE" : "LOGIN"}
                </span>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg ">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        {user.email}
                      </div>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          dispatch(openAuthModal());
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        Edit Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => {
                          dispatch(openAuthModal());
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartWrapper isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default NavBar;
