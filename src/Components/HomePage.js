import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import background from "../images/homePageBackground.JPG";
import logo from "../images/tvpLogo.png";
import locIcon from "../images/locIcon.png";
import dropDown from "../images/dropdown.png";
import AuthModal from "./AuthModal";
import { addToCart } from "../store/cartSlice";
import {
  getCart,
  loginUser,
  signUpUser,
  verifyOtp,
  logout,
  checkSession,
} from "../services/api";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser, setUser } from "../store/userSlice";
import { closeAuthModal } from "../store/modalSlice"; // Import the action

function HomePage() {
  const user = useSelector((state) => state.user.user);
  const showAuthModal = useSelector((state) => state.modal.showAuthModal); // Get the modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dispatch = useDispatch();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    async function getPlaces() {
      const lat = 53.752574;
      const lon = -2.3620782;
      const radius = 5000;

      const overpassQuery = `
                [out:json];
                (
                  node["place"](around:${radius},${lat},${lon});
                );
                out body;
            `;

      const url = "https://overpass-api.de/api/interpreter";

      try {
        const response = await axios.post(
          url,
          `data=${encodeURIComponent(overpassQuery)}`
        );
        const placesData = response.data.elements.map((place) => ({
          id: place.id,
          name: place.tags?.name || "Unknown",
          type: place.tags?.place || "Unknown",
          lat: place.lat,
          lon: place.lon,
        }));
        setPlaces(placesData);
      } catch (error) {
        console.error("Error fetching places:", error.message);
      }
    }

    getPlaces();
  }, []);

  useEffect(() => {
    async function fetchSession() {
      console.log("Checking session...");
      try {
        const res = await checkSession();
        console.log("Response received:", res.data);
        dispatch(setUser(res.data.user));
      } catch (error) {
        console.log("Error occurred:", error);
        dispatch(clearUser());
      }
    }

    fetchSession();
  }, [dispatch]);
  const PlaceTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 650,
  };

  const SelectTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
    backgroundColor: "#074711",
  };

  const MenuTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
    backgroundColor: "#AA1B17",
  };

  const OptionTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
  };

  const handleLogout = async (data) => {
    try {
      const response = await logout(data);
      console.log("Logout Successful:", response.data);
      dispatch(clearUser());
    } catch (error) {
      console.error("Log out Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Logout failed.");
    }
  };

  const handleLogin = async (data) => {
    try {
      const response = await loginUser(data);
      console.log("Login Successful:", response.data);
      dispatch(setUser(response.data));

      const cartResponse = await getCart(response.data.user.id);
      console.log("CART AFTER LOGIN DATA:", cartResponse);

      if (cartResponse.data.success && cartResponse.data.cart.length > 0) {
        const formattedCart = cartResponse.data.cart.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          image: item.image_url,
          description: item.additional_description,
          itemQuantity: item.quantity,
          totalPrice: item.total_price,
        }));

        formattedCart.forEach((cartItem) => dispatch(addToCart(cartItem)));
      }
      dispatch(closeAuthModal()); // Close the modal after successful login
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed.");
    }
  };

  const handleSignUp = async (data) => {
    try {
      const response = await signUpUser(data);
      if (response.data.success) {
        const otp = prompt("Enter the OTP sent to your email:");
        if (otp) {
          const verifyResponse = await verifyOtp(data, otp);
          if (verifyResponse.data.success) {
            alert("Account created successfully!");
            dispatch(closeAuthModal()); // Close the modal after successful signup
          } else {
            alert("OTP verification failed.");
          }
        }
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Signup failed.");
    }
  };

  const handleGuest = () => {
    console.log("Continue as Guest");
    dispatch(closeAuthModal()); // Close the modal when continuing as guest
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${background})`,
        }}
        className="min-h-screen bg-cover bg-center h-64 w-full"
      >
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 pt-20 sm:pt-40">
          <motion.div
            className="col-span-3 text-3xl sm:text-7xl grid px-4 lg:px-20"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div
              className="grid items-end justify-center lg:justify-start text-2xl lg:text-7xl"
              style={PlaceTextStyle}
            >
              Place your order now
            </div>
            <div className="grid grid-cols-4 py-4 sm:py-8 gap-4">
              <div className="relative col-span-3">
                <motion.button
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative flex w-full text-white pl-10 pr-10 py-1 lg:py-3 text-sm focus:outline-none"
                  style={SelectTextStyle}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      className="h-3 lg:h-5 w-auto"
                      src={locIcon}
                      alt="Location icon"
                    />
                  </div>

                  <span className="text-left text-xxxs lg:text-sm">
                    {selectedOption || "Select Destination to order"}
                  </span>

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <img
                      className="h-3 lg:h-5 w-auto"
                      src={dropDown}
                      alt="Dropdown icon"
                    />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="absolute w-full mt-0 bg-white border border-gray-200 shadow-lg z-50"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                        {places.length > 0 ? (
                          places.map((place) => (
                            <div
                              key={place.id}
                              className="px-4 py-2 text-xxxs lg:text-sm bg-white hover:bg-black hover:text-white cursor-pointer text-left border-b"
                              onClick={() => {
                                setSelectedOption(place.name);
                                setIsOpen(false);
                              }}
                            >
                              {place.name} ({place.type})
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-center text-gray-500">
                            Loading places...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                className="relative col-span-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className="flex w-full items-center justify-center text-black px-0 py-1 lg:py-3 text-xxxs lg:text-sm focus:outline-none"
                  style={MenuTextStyle}
                >
                  MENU
                </button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="col-span-3 sm:col-span-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img className="h-auto w-100" src={logo} alt="Logo" />
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
    </motion.div>
  );
}

export default HomePage;
