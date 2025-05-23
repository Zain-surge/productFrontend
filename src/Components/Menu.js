import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "./ItemCard";
import Footer from "./Footer";
// import menuItems from "./menuItems.json";
import Pizza from "../images/CLIPARTS/Pizzas.png";
import Shawarma from "../images/CLIPARTS/Shawarma.png";
import Burgers from "../images/CLIPARTS/Burgers.png";
import Calzones from "../images/CLIPARTS/Calzones.png";
import GarlicBread from "../images/CLIPARTS/GarlicBread.png";
import Wraps from "../images/CLIPARTS/Wraps.png";
import KidsMeal from "../images/CLIPARTS/KidsMeal.png";
import Sides from "../images/CLIPARTS/Sides.png";
import Drinks from "../images/CLIPARTS/Drinks.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CartModal from "./CartModal";
import Cart from "./Cart";
import AuthModal from "./AuthModal";
import { addToCart } from "../store/cartSlice";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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

const stripePromise = loadStripe(
  "pk_test_51Qjkvz09BvMasiZC1YmgMdc7JBgVwxMbD1wG1Mu1i4ec3j51DaVw9ypm4HNCM6ox08X51MHCypKJcENwIALs0qzl00oeH8G11i"
);

function Menu({ menuItems, offers }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Pizza");
  const [selectedSubItem, setSelectedSubItem] = useState("Pizza");
  const [direction, setDirection] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [totalShown, setTotalShown] = useState(3);
  const [cartModalItem, setCartModalItem] = useState(null);
  const [iconSize, setIconSize] = useState(32);
  const user = useSelector((state) => state.user.user);
  const showAuthModal = useSelector((state) => state.modal.showAuthModal); // Get the modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const [places, setPlaces] = useState([]);
  const dispatch = useDispatch();

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

  useEffect(() => {
    const updateTotalShown = () => {
      if (window.innerWidth >= 1200) {
        setTotalShown(5); // Desktop
        setIconSize(32);
      } else if (window.innerWidth >= 768) {
        setTotalShown(7); // Tablet
        setIconSize(24);
      } else {
        setTotalShown(4); // Mobile
        setIconSize(12);
      }
    };

    updateTotalShown(); // Set initial state
    window.addEventListener("resize", updateTotalShown);

    return () => {
      window.removeEventListener("resize", updateTotalShown);
    };
  }, []);

  const handleAddToCart = (item) => {
    handleCloseCartModal();
  };

  const menuCategories = [
    "Pizza",
    "Shawarma",
    "Burgers",
    "Calzones",
    "GarlicBread",
    "Wraps",
    "KidsMeal",
    "Sides",
    "Drinks",
  ];
  const PizzaCategory = [
    "Pizza",
    "Pizze speciali",
    "Pizze le saporite",
    "BBQ Pizza",
    "Fish Pizza",
  ];

  const ShawarmaCategory = [
    "Donner & Shawarma kebab",
    "Shawarma & kebab trays",
  ];

  const images = {
    Pizza,
    Shawarma,
    Burgers,
    Calzones,
    GarlicBread,
    Wraps,
    KidsMeal,
    Sides,
    Drinks,
  };

  const handleClick = (item) => {
    console.log(menuItems);
    const currentIndex = menuCategories.indexOf(selectedItem);
    const newIndex = menuCategories.indexOf(item);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedItem(item);
    if (item === "Shawarma") {
      setSelectedSubItem("Donner & Shawarma kebab");
    }
    if (item === "Pizza") {
      setSelectedSubItem("Pizza");
    }
  };
  const handleSubItemSelect = (subItem) => {
    setSelectedSubItem(subItem);
  };

  const MenuTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 550,
    marginTop: "5px",
    transition: "all 0.3s ease",
  };

  const MenuTextStyleHover = {
    ...MenuTextStyle,
    backgroundColor: "#AA1B17",
    borderRadius: "15px",
    color: "white",
  };

  const imageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const imageTransition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  const handlePrevPage = () => {
    setVisibleStartIndex((prev) => Math.max(0, prev - 1));
    setDirection(-1);
  };

  const handleNextPage = () => {
    setVisibleStartIndex((prev) =>
      Math.min(menuCategories.length - totalShown, prev + 1)
    );
    setDirection(1);
  };

  const handleOpenCartModal = (item) => {
    setCartModalItem(item);
  };

  const handleCloseCartModal = () => {
    setCartModalItem(null);
  };
  const sliderRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth >= 1024) {
      // Only enable on desktop
      const slider = sliderRef.current;
      if (slider) {
        const { left, width } = slider.getBoundingClientRect();
        const mouseX = e.clientX - left;
        const move = (mouseX / width - 0.5) * 200; // Adjust scroll sensitivity
        slider.style.transform = `translateX(${move}px)`;
      }
    }
  };

  const renderCategoryImages = () => {
    return (
      <motion.div
        className="flex cursor-grab w-[400px] lg:w-[1080px]"
        drag="x"
        dragConstraints={{
          left: -((menuCategories.length - totalShown) * 120),
          right: 0,
        }}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: 0 }} // Ensures it starts from the first category
        animate={{ x: 0 }}
        style={{
          // width: menuCategories.length * 120, // Ensures all items fit
          paddingLeft: "10px", // Add padding to avoid cutting
          paddingRight: "10px", // Same on the right
        }}
      >
        {menuCategories.map((category) => (
          <div
            key={category}
            className="flex flex-col items-center min-w-[95px] lg:min-w-[160px] mx-1 lg:mx-2"
            onClick={() => handleClick(category)}
            style={{ cursor: "pointer" }}
          >
            <img
              className="h-16 lg:h-28 w-auto"
              src={images[category]}
              alt={category}
            />
            <div
              className="text-xxs lg:text-base text-center px-2"
              style={
                selectedItem === category ? MenuTextStyleHover : MenuTextStyle
              }
            >
              {category.toUpperCase()}
            </div>
          </div>
        ))}
      </motion.div>
    );
  };

  const renderOffers = () => {
    return (
      <div className="flex flex-wrap gap-4 mt-8 px-8 lg:px-12 pb-[0.5rem] lg:pb-[0.6rem] justify-start bg-white w-[100%]">
        {offers
          .filter((offer) => offer.value === true)
          .map((offer, index) => (
            <div
              key={index}
              className="p-2 text-white bg-[#AA1B17] text-center text-xxs lg:text-xs"
              style={{
                width: "max-content",
                borderRadius: "12px",
                fontFamily: "Bambino",
                fontWeight: 350,
              }}
            >
              {offer.offer_text}
            </div>
          ))}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-4">
        {/* Render offers below categories */}
        <div
          className="mt-12"
          style={{
            position: "fixed",
            zIndex: "30",
            width: "100%",
            backgroundColor: "FFFFFF",
          }}
        >
          {renderOffers()}
        </div>
        <div className="mt-28 col-span-4 lg:col-span-3 ">
          <div className="flex items-center justify-center relative">
            {/* {visibleStartIndex > 0 && (
              <button
                onClick={handlePrevPage}
                className="absolute z-10 left-[2%] top-[20%] lg:left-[7%] lg:top-[30%]"
              >
                <ChevronLeft size={iconSize} />
              </button>
            )} */}
            <AnimatePresence initial={false} custom={direction}>
              return (
              <div
                className="fixed mt-28 lg:mt-44 w-[100%] lg:w-[75%]"
                style={{ backgroundColor: "#FFFFFF", zIndex: "20" }}
              >
                <div
                  className="overflow-x-auto no-scrollbar flex justify-start overflow-y-hidden mb-4"
                  style={{ scrollbarWidth: "none" }}
                >
                  {renderCategoryImages()}
                </div>
              </div>
              );
            </AnimatePresence>
            {/* {visibleStartIndex < menuCategories.length - totalShown && (
              <button
                onClick={handleNextPage}
                className="absolute z-10 right-[2%] top-[20%] lg:right-[7%] lg:top-[30%]"
              >
                <ChevronRight size={iconSize} />
              </button>
            )} */}
          </div>
          {/* Pizza Size */}
          {selectedItem === "Pizza" && (
            <div className="grid grid-cols-2 lg:grid-cols-5 pt-2 mt-24 lg:mt-36 px-2 lg:px-12 pb-12 lg:pb-0 bg-white ">
              <div
                className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 fixed bg-white w-[100%] pt-2 pb-2"
                style={{ zIndex: "30", backgroundColor: "FFFFFF" }}
              >
                {PizzaCategory.map((pizza) => (
                  <motion.button
                    key={pizza}
                    onClick={() => handleSubItemSelect(pizza)}
                    className={`px-2 lg:px-4 py-0 lg:py-1 text-xs lg:text-base transition-colors ${
                      selectedSubItem === pizza
                        ? "bg-green-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    style={{
                      borderRadius: "12px",
                      fontFamily: "Bambino",
                      fontWeight: 450,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pizza.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {selectedItem === "Shawarma" && (
            <div className="grid grid-cols-2 lg:grid-cols-5 pt-2 mt-24 lg:mt-36 px-2 lg:px-12 pb-12 lg:pb-0 bg-white">
              <div
                className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 fixed bg-white w-[100%] pt-2 pb-2"
                style={{ zIndex: "30", backgroundColor: "FFFFFF" }}
              >
                {ShawarmaCategory.map((pizza) => (
                  <motion.button
                    key={pizza}
                    onClick={() => handleSubItemSelect(pizza)}
                    className={`px-2 lg:px-4 py-0 lg:py-1 text-xs lg:text-base transition-colors ${
                      selectedSubItem === pizza
                        ? "bg-green-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    style={{
                      borderRadius: "12px",
                      fontFamily: "Bambino",
                      fontWeight: 450,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pizza.toUpperCase()}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          {selectedItem != "Shawarma" && selectedItem != "Pizza" && (
            <div className="grid grid-cols-2 lg:grid-cols-5 pt-2 mt-24 mx-12 bg-white"></div>
          )}

          <AnimatePresence custom={direction}>
            <motion.div
              key={selectedItem}
              custom={direction}
              initial="initial"
              animate="in"
              exit="out"
              variants={{
                initial: (direction) => ({
                  x: direction > 0 ? 1000 : -1000,
                  opacity: 0,
                }),
                in: {
                  x: 0,
                  opacity: 1,
                },
                out: (direction) => ({
                  x: direction > 0 ? -1000 : 1000,
                  opacity: 0,
                }),
              }}
              transition={{
                type: "tween",
                ease: "anticipate",
                duration: 0.5,
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-8 mx-4 lg:mx-20 mt-0 lg:mt-16"
              style={{ position: "relative", zIndex: "10" }}
            >
              {menuItems.map(
                (item) =>
                  item.Type === selectedItem &&
                  (item.subType === selectedSubItem ||
                    item.subType === null) && (
                    <div key={item.id} className="col-span-1">
                      <ItemCard
                        menuItems={item}
                        onAddToCart={() => handleOpenCartModal(item)}
                      />
                    </div>
                  )
              )}
            </motion.div>
          </AnimatePresence>

          {cartModalItem && (
            <CartModal
              isOpen={!!cartModalItem}
              onClose={handleCloseCartModal}
              item={cartModalItem}
            />
          )}
        </div>
        {/* Cart Component */}
        <div className="hidden lg:block col-span-1 ">
          <Elements stripe={stripePromise}>
            <Cart
              isOpen={true}
              onClose={() => setIsCartOpen(false)}
              menuItems={menuItems}
            />
          </Elements>
        </div>
        <AnimatePresence>
          {showAuthModal && !user && (
            <AuthModal
              onClose={() => dispatch(closeAuthModal())} // Dispatch the action to close the modal
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              onGuest={handleGuest}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default Menu;
