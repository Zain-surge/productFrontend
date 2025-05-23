import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminItemCard from "./AdminItemCard";
import CartModal from "./AdminCartModal";
import AdminCart from "./AdminCart";
import { useDispatch } from "react-redux";
import Pizza from "../images/CLIPARTS/PizzasS.png";
import Shawarma from "../images/CLIPARTS/ShawarmaS.png";
import Burgers from "../images/CLIPARTS/BurgersS.png";
import Calzones from "../images/CLIPARTS/CalzonesS.png";
import GarlicBread from "../images/CLIPARTS/GarlicBreadS.png";
import Wraps from "../images/CLIPARTS/WrapsS.png";
import KidsMeal from "../images/CLIPARTS/KidsMealS.png";
import Sides from "../images/CLIPARTS/SidesS.png";
import Drinks from "../images/CLIPARTS/DrinksS.png";

function AdminMenu({ menuItems }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Pizza");
  const [direction, setDirection] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [totalShown, setTotalShown] = useState(3);
  const [cartModalItem, setCartModalItem] = useState(null);
  const [iconSize, setIconSize] = useState(32);

  const dispatch = useDispatch();
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

  const handleClick = (item) => {
    console.log(menuItems);
    const currentIndex = menuCategories.indexOf(selectedItem);
    const newIndex = menuCategories.indexOf(item);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedItem(item);
  };

  const MenuTextStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
    marginTop: "5px",
    transition: "all 0.3s ease",
  };

  const MenuTextStyleHover = {
    ...MenuTextStyle,
    backgroundColor: "#F2D9F9",
    borderRadius: "15px",
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

  return (
    <>
      <div className="grid grid-cols-3">
        <div className="col-span-3 md:col-span-2 ">
          <div className="flex items-center justify-start relative">
            <AnimatePresence initial={false} custom={direction}>
              return (
              <div
                className="fixed  w-[100%] lg:w-[66%]"
                style={{
                  backgroundColor: "#FFFFFF",
                  zIndex: "20",
                  paddingTop: "3.8rem",
                }}
              >
                <div
                  className="overflow-x-auto no-scrollbar flex justify-start overflow-y-hidden mb-4 pt-56"
                  style={{ scrollbarWidth: "none" }}
                >
                  {renderCategoryImages()}
                </div>
              </div>
              );
            </AnimatePresence>
          </div>
          <div className="w-2/3 flex justify-center mt-4 mb-6 z-30  fixed">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search in items`}
              className="w-3/4 md:w-1/2 lg:w-3/4 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F2D9F9] text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            />
          </div>
          <div
            className="w-[60%] h-[3px] bg-gray-300 mx-10 mt-[13.7rem] fixed"
            style={{ zIndex: "80" }}
          />
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
              className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8 mx-4 md:mx-20 mt-60 mb-24"
              style={{ position: "relative", zIndex: "10" }}
            >
              {/* {menuItems.map(
                (item) =>
                  item.Type === selectedItem && (
                    <div key={item.id} className="col-span-1">
                      <AdminItemCard
                        menuItems={item}
                        onAddToCart={() => handleOpenCartModal(item)}
                      />
                    </div>
                  )
              )} */}
              {menuItems
                .filter((item) => {
                  const matchesSearch = item.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  if (searchTerm.trim() === "") {
                    return item.Type === selectedItem;
                  }
                  return matchesSearch;
                })
                .map((item) => (
                  <div key={item.id} className="col-span-1">
                    <AdminItemCard
                      menuItems={item}
                      onAddToCart={() => handleOpenCartModal(item)}
                    />
                  </div>
                ))}
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
        <div
          className="col-span-1 px-8 pt-6 border-l h-[90vh] border-gray-600 fixed top-0 right-0 w-[34%]"
          style={{ zIndex: "100" }}
        >
          {/* <Elements stripe={stripePromise}> */}
          <AdminCart
            isOpen={true}
            onClose={() => setIsCartOpen(false)}
            menuItems={menuItems}
          />
          {/* </Elements> */}
        </div>
      </div>
    </>
  );
}

export default AdminMenu;
