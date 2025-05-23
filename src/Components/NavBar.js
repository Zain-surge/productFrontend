import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../images/tvpLogo.png";
import cartIcon from "../images/cart.png";
import CartWrapper from "./CartWrapper";
import personIcon from "../images/person.png";
import axios from "axios";
import { clearUser, setUser } from "../store/userSlice";
import { clearCart } from "../store/cartSlice";
import { openAuthModal } from "../store/modalSlice"; // Import the action

function NavBar() {
  const totalItems = useSelector((state) => state.cart.items.length);
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items); // Get cart items
  const showAuthModal = useSelector((state) => state.modal.showAuthModal); // Get the modal state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();

  useEffect(() => {
    axios
      .get("https://thevillage-backend.onrender.com/auth/check-session", {
        withCredentials: true,
      })
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      console.log("LOGGING OUT");
      await saveCartItems();
      await axios.post(
        "https://thevillage-backend.onrender.com/auth/logout",
        {},
        { withCredentials: true }
      );
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
        await axios.post(
          "https://thevillage-backend.onrender.com/cart/saveCart",
          {
            userId: user.id, // Assuming user.id is available
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
        await saveCartItems(); // Save cart items before leaving the page
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

  const NavBarTextStyleHover = {
    fontFamily: "Bambino",
    fontWeight: 750,
    textDecoration: "underline",
    textDecorationColor: "#AA1B17",
    textDecorationThickness: "3px",
    textUnderlineOffset: "5px",
  };

  const NavBarTextStyleMobile = {
    fontFamily: "Bambino",
    fontWeight: 750,
    color: "#FFFFFF",
  };

  const NavBarTextStyleHoverMobile = {
    fontFamily: "Bambino",
    fontWeight: 750,
    color: "#FFFFFF",
    textDecoration: "underline",
    textDecorationColor: "#000000",
    textDecorationThickness: "3px",
    textUnderlineOffset: "5px",
  };

  return (
    <div>
      <nav
        className="fixed top-0 z-50 w-full"
        style={
          isActive("/") || isActive("/contact")
            ? { backgroundColor: "#FFFFFF" }
            : { backgroundColor: "transparent" }
        }
      >
        <div>
          <div className="lg:relative grid h-20 grid-cols-3 lg:grid-cols-1">
            <div className="lg:absolute inset-y-0 left-0 flex items-center lg:hidden col-span-1">
              <button
                type="button"
                className={`relative inline-flex items-center justify-center rounded-md p-2 text-[#000000] hover:bg-[#AA1B17] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-auto items-center justify-center lg:justify-between col-span-1">
              <div className="flex justify-center lg:justify-start items-center mx-10">
                <img className="h-12 w-auto" src={logo} alt="Logo" />
              </div>
              <div className="hidden lg:block h-20 w-2/3 mx-4">
                <div className="flex justify-end items-center">
                  {/* <Link
                    to="/"
                    className="nav-link my-3 py-1 px-3 lg:px-6 lg:px-8 text-xs lg:text-sm lg:text-md"
                    style={
                      isActive("/") ? NavBarTextStyleHover : NavBarTextStyle
                    }
                  >
                    HOME
                  </Link> */}
                  <Link
                    to="/"
                    className="nav-link my-3 py-1 px-3 lg:px-6 lg:px-8 text-xs lg:text-sm lg:text-md"
                    style={
                      isActive("/") ? NavBarTextStyleHover : NavBarTextStyle
                    }
                  >
                    MENU
                  </Link>

                  <Link
                    to="/contact"
                    className="nav-link my-3 py-1 px-3 lg:px-6 lg:px-8 text-xs lg:text-sm lg:text-md"
                    style={
                      isActive("/contact")
                        ? NavBarTextStyleHover
                        : NavBarTextStyle
                    }
                  >
                    CONTACT US
                  </Link>
                  {/* <div className="relative">
                    <button onClick={() => setIsCartOpen(true)}>
                      <img
                        className="h-10 w-auto my-3 px-3"
                        src={cartIcon}
                        alt="Cart Icon"
                      />
                      {totalItems > 0 && (
                        <span className="absolute top-2 right-1 bg-red-700 text-white text-xs rounded-full px-2">
                          {totalItems}
                        </span>
                      )}
                    </button>
                  </div> */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    >
                      <img
                        className="h-10 w-auto my-3 px-3"
                        src={personIcon}
                        alt="Person Icon"
                      />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
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
                              onClick={() => dispatch(openAuthModal())} // Dispatch the action to open the modal
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
            </div>

            <div className="flex justify-end lg:relative lg:hidden top-4 col-span-1">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img
                  className="h-6 w-auto my-3 px-3"
                  src={personIcon}
                  alt="Person Icon"
                />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-14 w-20 mr-12 bg-white border border-gray-200 shadow-lg z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700">
                        {user.email}
                      </div>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-xxs text-gray-700 hover:bg-gray-100"
                        onClick={() => dispatch(openAuthModal())}
                      >
                        Edit Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-xxs text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-xxs text-gray-700 hover:bg-gray-100"
                        onClick={() => dispatch(openAuthModal())} // Dispatch the action to open the modal
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              )}

              <button onClick={() => setIsCartOpen(true)}>
                <img
                  className="h-6 w-auto my-3 px-3"
                  src={cartIcon}
                  alt="Cart Icon"
                />
                {totalItems > 0 && (
                  <span className="absolute top-2 right-1 bg-red-700 text-white text-xs rounded-full px-2">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${isMobileMenuOpen ? "block" : "hidden"} lg:hidden w-1/2`}
          id="mobile-menu"
          style={{ backgroundColor: "#AA1B17" }}
        >
          <div className="grid justify-start px-2 pb-3 pt-2">
            {/* <Link
              to="/"
              className="nav-link block px-5 py-2 text-left"
              onClick={() => setIsMobileMenuOpen(false)}
              style={
                isActive("/")
                  ? NavBarTextStyleHoverMobile
                  : NavBarTextStyleMobile
              }
            >
              HOME
            </Link> */}
            <Link
              to="/"
              className="nav-link block px-5 py-2 text-left"
              style={
                isActive("/")
                  ? NavBarTextStyleHoverMobile
                  : NavBarTextStyleMobile
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MENU
            </Link>

            <Link
              to="/contact"
              className="nav-link block px-5 py-2 text-left"
              onClick={() => setIsMobileMenuOpen(false)}
              style={
                isActive("/contact")
                  ? NavBarTextStyleHoverMobile
                  : NavBarTextStyleMobile
              }
            >
              CONTACT US
            </Link>
          </div>
        </div>

        <CartWrapper isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </nav>
    </div>
  );
}

export default NavBar;
