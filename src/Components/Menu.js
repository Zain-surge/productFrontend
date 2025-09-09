import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "./ItemCard";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { colors } from "../colors";
import Pizza from "../images/CLIPARTS/Pizzas.png";
import Shawarma from "../images/CLIPARTS/Shawarma.png";
import Burgers from "../images/CLIPARTS/Burgers.png";
import Calzones from "../images/CLIPARTS/Calzones.png";
import GarlicBread from "../images/CLIPARTS/GarlicBread.png";
import Wraps from "../images/CLIPARTS/Wraps.png";
import KidsMeal from "../images/CLIPARTS/KidsMeal.png";
import Sides from "../images/CLIPARTS/Sides.png";
import Drinks from "../images/CLIPARTS/Drinks.png";
import Milkshake from "../images/CLIPARTS/Milkshake.png";
import Dips from "../images/CLIPARTS/Dips.png";
import Deals from "../images/CLIPARTS/Deals.png";
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
import { clearUser, setUser } from "../store/userSlice";
import { closeAuthModal } from "../store/modalSlice"; // Import the action

const stripePromise = loadStripe(
  "pk_test_51Qjkvz09BvMasiZC1YmgMdc7JBgVwxMbD1wG1Mu1i4ec3j51DaVw9ypm4HNCM6ox08X51MHCypKJcENwIALs0qzl00oeH8G11i"
);

function Menu() {
  const menuItems = useSelector((state) => state.menuItems.items);
  const menuItemsLoading = useSelector((state) => state.menuItems.loading);
  const menuItemsError = useSelector((state) => state.menuItems.error);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Pizza");
  const [selectedSubItem, setSelectedSubItem] = useState("Pizza");
  const [direction, setDirection] = useState(0);
  const [totalShown, setTotalShown] = useState(3);
  const [cartModalItem, setCartModalItem] = useState(null);
  const user = useSelector((state) => state.user.user);
  const showAuthModal = useSelector((state) => state.modal.showAuthModal);
  const offers = useSelector((state) => state.offers?.list || []);
  const [hovered, setHovered] = useState(false);
  const dispatch = useDispatch();

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
      toast.error(error.response?.data?.message || "Login failed.");
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
            toast.success("Account created successfully!");

            dispatch(closeAuthModal()); // Close the modal after successful signup
          } else {
            toast.error("OTP verification failed.");
          }
        }
      }
    } catch (error) {
      console.error("Signup Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Signup failed.");
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
      } else if (window.innerWidth >= 768) {
        setTotalShown(7); // Tablet
      } else {
        setTotalShown(4); // Mobile
      }
    };

    updateTotalShown(); // Set initial state
    window.addEventListener("resize", updateTotalShown);

    return () => {
      window.removeEventListener("resize", updateTotalShown);
    };
  }, []);

  const menuCategories = [
    "Pizza",
    "Shawarma",
    "Burgers",
    "Calzones",
    "GarlicBread",
    "Wraps",
    "Deals",
    "KidsMeal",
    "Sides",
    "Milkshake",
    "Drinks",
    "Dips",
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
    Deals,
    KidsMeal,
    Sides,
    Milkshake,
    Drinks,
    Dips,
  };
  useEffect(() => {
  console.log("Menu items updated:", menuItems);
}, [menuItems]);

  const handleClick = (item) => {
    console.log(offers);
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
    backgroundColor: colors.primaryRed,
    borderRadius: "15px",
    color: "white",
  };

  const handleOpenCartModal = (item) => {
    setCartModalItem(item);
  };

  const handleCloseCartModal = () => {
    setCartModalItem(null);
  };
  if (menuItemsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading menu...
      </div>
    );
  }

  if (menuItemsError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading menu: {menuItemsError}
      </div>
    );
  }

  const renderOffers = () => {
    return (
      <div className="w-full mt-3 md:mt-6 pl-3 pr-3 lg:pl-0 lg:pr-8 pb-3 lg:pb-0">
        <div className="overflow-x-auto whitespace-nowrap custom-scrollbar3 pb-1">
          {offers &&
            offers
              .filter((offer) => offer.value === true)
              .map((offer, index) => (
                <div
                  key={index}
                  className="inline-block p-2 text-white text-center text-xxs lg:text-xs mr-4"
                  style={{
                    borderRadius: "12px",
                    fontFamily: "Bambino",
                    fontWeight: 350,
                    backgroundColor: colors.primaryRed,
                  }}
                >
                  {offer.offer_text}
                </div>
              ))}
        </div>
      </div>
    );
  };

  const renderCategoryImages = () => {
    return (
      <div className="w-full px-3 lg:px-10">
        <div className="overflow-x-auto whitespace-nowrap custom-scrollbar2 pb-0 lg:pb-1">
          {menuCategories.map((category) => (
            <div
              key={category}
              className="inline-block p-2 text-center text-xxs lg:text-xs mr-3 lg:mr-10"
              onClick={() => handleClick(category)}
              style={{ cursor: "pointer" }}
            >
              <div className="flex flex-col items-center justify-center">
                <img
                  className="h-16 lg:h-28 w-auto"
                  src={images[category]}
                  alt={category}
                />
                <div
                  className="text-xxs lg:text-base text-center px-2 w-full flex justify-center items-center"
                  style={
                    selectedItem === category
                      ? MenuTextStyleHover
                      : MenuTextStyle
                  }
                >
                  {category.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-4">
        {/* Render offers below categories */}
        <div
          className="fixed top-0 left-0 lg:left-32  w-[100%] lg:w-[67%] bg-white lg:bg-transparent"
          style={{
            zIndex: 46,
          }}
        >
          {renderOffers()}
        </div>
        <div
          className="fixed top-[3.25rem] lg:top-16 left-0  w-[100%] lg:w-[75%] bg-white"
          style={{ zIndex: 47 }}
        >
          {renderCategoryImages()}
        </div>
        <div
          className="fixed top-[9.8rem] lg:top-[14.4rem] left-0  w-[100%] lg:w-[75%] bg-white"
          style={{ zIndex: 47 }}
        >
          {selectedItem === "Pizza" && (
            <div className="w-full px-3 lg:px-10 pt-2 lg:pt-3 pb-1">
              <div className="overflow-x-auto pb-1">
                {PizzaCategory.map((pizza) => {
                  const isSelected = selectedSubItem === pizza;

                  return (
                    <motion.button
                      key={pizza}
                      onClick={() => handleSubItemSelect(pizza)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                      className="px-2 lg:px-4 py-1 lg:py-1 text-xs lg:text-base transition-colors mr-2 inline-block items-center justify-center" // Added flex classes
                      style={{
                        backgroundColor: isSelected
                          ? colors.primaryGreen
                          : hovered
                            ? "#d1d5db"
                            : "#e5e7eb",
                        color: isSelected ? "#ffffff" : "#374151",
                        borderRadius: "12px",
                        fontFamily: "Bambino",
                        fontWeight: 450,
                        transition: "all 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {pizza.toUpperCase()}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedItem === "Shawarma" && (
            <div className="w-full px-3 lg:px-10 pt-2 lg:pt-3 pb-1">
              <div className="overflow-x-auto pb-1">
                {ShawarmaCategory.map((pizza) => {
                  const isSelected = selectedSubItem === pizza;

                  return (
                    <motion.button
                      key={pizza}
                      onClick={() => handleSubItemSelect(pizza)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => setHovered(true)}
                      onMouseLeave={() => setHovered(false)}
                      className="px-2 lg:px-4 py-1 lg:py-1 text-xs lg:text-base transition-colors mr-2 justify-center align-middle"
                      style={{
                        backgroundColor: isSelected
                          ? colors.primaryGreen
                          : hovered
                            ? "#d1d5db"
                            : "#e5e7eb",
                        color: isSelected ? "#ffffff" : "#374151",
                        borderRadius: "12px",
                        fontFamily: "Bambino",
                        fontWeight: 450,
                        transition: "all 0.2s ease-in-out",
                        cursor: "pointer",
                      }}
                    >
                      {pizza.toUpperCase()}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-56 col-span-4 lg:col-span-3 ">
          <AnimatePresence custom={direction}>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-8 mx-4 lg:mx-20 mt-0 lg:mt-16"
              style={{ position: "relative", zIndex: "10" }}
            >
              {menuItems.map(
                (item) =>
                  item.Type === selectedItem &&
                  (item.subType === selectedSubItem ||
                    item.subType === null) && item.availability === true && item.website===true && (
                    <div key={`${item.id}-${item.availability}`} className="col-span-1">
                      <ItemCard
                        menuItems={item}
                        onAddToCart={() => handleOpenCartModal(item)}
                      />
                    </div>
                  )
              )}
            </div>
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}

export default Menu;
