import React, { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion"; // Import Framer Motion

import { Minus, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { ChevronDown, ChevronUp } from "lucide-react";
import { colors } from "../colors";

const CartModal = ({ isOpen, onClose, item }) => {
  const sizeOptions = Object.keys(item.price);
  // Extract pre-defined items from item prop if they exist
  const preSelectedToppings = item.toppings || [];
  const preSelectedSauces = item.sauces || [];
  const preSelectedCheeses = item.cheese || [];
  const [expanded, setExpanded] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const sauces = [
    "Mayo",
    "Ketchup",
    "Chilli sauce",
    "Sweet chilli",
    "Garlic Sauce",
  ];

  const cheeses = [
    "Mozzarella",
    "Emmental",
    "Taleggio",
    "Gorgonzola",
    "Brie",
    "Grana",
    "Buffalo mozzarella",
  ];

  const toppings = [
    "Mushrooms",
    "Artichoke",
    "Carcioffi",
    "Onion",
    "Red onion",
    "Green chillies",
    "Red pepper",
    "Pepper",
    "Rocket",
    "Spinach",
    "Parsley",
    "Fresh cherry tomatoes",
    "Capers",
    "Oregano",
    "Egg",
    "Sweetcorn",
    "Chips",
    "Pineapple",
    "Chilli",
    "Basil",
    "Olives",
    "Sausages",
  ];

  const validToppings = preSelectedToppings.filter((topping) =>
    toppings.includes(topping)
  );
  const validSauces = preSelectedSauces.filter((sauce) =>
    sauces.includes(sauce)
  );
  const validCheese = preSelectedCheeses.filter((cheese) =>
    cheeses.includes(cheese)
  );

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const [selectedFlavor, setSelectedFlavor] = useState("Apple & Raspberry");
  const [quantity, setQuantity] = useState(1);
  const [initialPrice, setInitialPrice] = useState(item.price);
  const [selectedToppings, setSelectedToppings] = useState([...validToppings]);
  const [selectedSauces, setSelectedSauces] = useState([...validSauces]);
  const [selectedCheeses, setSelectedCheeses] = useState([...validCheese]);
  const [selectedBase, setSelectedBase] = useState(["Tomato"]);
  const [selectedCrust, setSelectedCrust] = useState("Normal");
  const [noSalad, setNoSalad] = useState(false);
  const [noSauce, setNoSauce] = useState(false);
  const [noCream, setNoCream] = useState(false);

  const [selectedDrink, setSelectedDrink] = useState(""); // if meal is selected

  const [isMeal, setIsMeal] = useState(false);
  const modalRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const dispatch = useDispatch();
  const flavors = [
    "Apple & Raspberry",
    "Apple & Mango",
    "Orange & Passion Fruit",
  ];

  const bases = ["BBQ", "Garlic", "Tomato"];
  const sizes = ['10"', '12"', '18"'];
  const crusts = ["Normal", "Stuffed"];
  const getSortedOptions = () => {
    const allOptions = [...toppings, ...cheeses];

    return allOptions.sort((a, b) => {
      const aIsSelected = toppings.includes(a)
        ? selectedToppings.includes(a)
        : selectedCheeses.includes(a);

      const bIsSelected = toppings.includes(b)
        ? selectedToppings.includes(b)
        : selectedCheeses.includes(b);

      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      return 0;
    });
  };

  const sortedOptions = getSortedOptions();
  const visibleOptions = sortedOptions;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };
  const handleFlavorSelect = (flavor) => {
    setSelectedFlavor(flavor);
  };
  const handleCrustSelect = (crust) => {
    setSelectedCrust(crust);
  };

  // Modified to prevent deselection of pre-selected items
  const handleToppingToggle = (topping) => {
    if (preSelectedToppings.includes(topping)) {
      // Don't allow deselection of pre-selected toppings
      return;
    }

    setSelectedToppings(
      (prev) =>
        prev.includes(topping)
          ? prev.filter((t) => t !== topping)
          : [...prev, topping] // appends to end
    );
  };

  // Modified to prevent deselection of pre-selected sauces
  const handleSauceToggle = (sauce) => {
    if (preSelectedSauces.includes(sauce)) {
      // Don't allow deselection of pre-selected sauces
      return;
    }

    setSelectedSauces((prev) =>
      prev.includes(sauce) ? prev.filter((t) => t !== sauce) : [...prev, sauce]
    );
  };

  // Modified to prevent deselection of pre-selected cheeses
  const handleCheeseToggle = (cheese) => {
    if (preSelectedCheeses.includes(cheese)) {
      // Don't allow deselection of pre-selected cheeses
      return;
    }

    setSelectedCheeses(
      (prev) =>
        prev.includes(cheese)
          ? prev.filter((c) => c !== cheese)
          : [...prev, cheese] // keep new ones at end
    );
  };
  const toggleMeal = () => {
    setIsMeal((prev) => !prev);
  };
  const calculatePrice = () => {
    debugger;
    console.log("DETAILS OF ITEM:", selectedSauces);
    let basePrice = 0;
    if (
      item.Type == "Pizza" ||
      item.Type == "Burgers" ||
      item.Type == "Shawarma" ||
      item.Type == "GarlicBread"
    ) {
      basePrice = item.price[selectedSize] || 0;
    } else {
      basePrice = item.price["default"] || 0;
    }
    basePrice = Number(basePrice);
    // Get price for selected size
    let crustPrice = 0;
    let toppingsPrice = 0;
    let basesPrice = 0;
    let mealPrice = 0;
    let cheesePrice = 0;
    let saucePrice = 0;

    if (selectedCrust === "Stuffed") {
      if (selectedSize === "10 inch") crustPrice = 1.5;
      else if (selectedSize === "12 inch") crustPrice = 2.5;
      else if (selectedSize === "18 inch") crustPrice = 4.5;
    }
    if (
      selectedToppings.length > 0 &&
      selectedToppings.length != validToppings.length
    ) {
      if (selectedSize === "10 inch")
        toppingsPrice = 1.0 * (selectedToppings.length - validToppings.length);
      else if (selectedSize === "12 inch")
        toppingsPrice = 1.5 * (selectedToppings.length - validToppings.length);
      else if (selectedSize === "18 inch")
        toppingsPrice = 5.5 * (selectedToppings.length - validToppings.length);
    }

    if (
      selectedCheeses.length > 0 &&
      selectedCheeses.length != validCheese.length
    ) {
      if (selectedSize === "10 inch")
        cheesePrice = 1.0 * (selectedCheeses.length - validCheese.length);
      else if (selectedSize === "12 inch")
        cheesePrice = 1.5 * (selectedCheeses.length - validCheese.length);
      else if (selectedSize === "18 inch")
        cheesePrice = 5.5 * (selectedCheeses.length - validCheese.length);
    }
    if (selectedBase.includes("BBQ")) {
      if (selectedSize === "10 inch") basesPrice += 0.99;
      else if (selectedSize === "12 inch") basesPrice += 1.5;
      else if (selectedSize === "18 inch") basesPrice += 4.0;
    }

    if (selectedBase.includes("Garlic")) {
      if (selectedSize === "10 inch") basesPrice += 0.99;
      else if (selectedSize === "12 inch") basesPrice += 1.5;
      else if (selectedSize === "18 inch") basesPrice += 4.0;
    }

    if (isMeal) {
      mealPrice = 1.9;
    }
    const extraSauces = selectedSauces.filter(
      (sauce) => !preSelectedSauces.includes(sauce)
    );
    extraSauces.forEach((sauce) => {
      if (["Garlic Sauce", "Chilli sauce"].includes(sauce)) {
        saucePrice += 0.75;
      } else {
        saucePrice += 0.5;
      }
    });
    console.log(typeof basePrice);
    console.log(typeof mealPrice);
    console.log("HEJNJBFJB", basePrice + mealPrice);

    return (
      basePrice +
      crustPrice +
      toppingsPrice +
      basesPrice +
      mealPrice +
      cheesePrice +
      saucePrice
    );
  };

  const handleBaseToggle = (base) => {
    if (base === "Tomato") {
      // Do nothing – always required
      return;
    }
    setSelectedBase((prev) =>
      prev.includes(base) ? prev.filter((t) => t !== base) : [...prev, base]
    );
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    const descriptionParts = [];

    if (selectedSize) descriptionParts.push(`Size: ${selectedSize}`);
    if (item.Type === "Burgers") {
      if (noSalad) descriptionParts.push("No Salad");
      if (noSauce) descriptionParts.push("No Sauce");
    }
    if (item.Type === "Milkshake" && noCream) {
      descriptionParts.push("No Cream");
    }

    if (item.Type === "Drinks" && item.title === "J20 GLASS BOTTLE")
      descriptionParts.push(`Flavor: ${selectedFlavor}`);
    if (item.Type === "Pizza" || item.Type === "GarlicBread") {
      if (selectedBase.length > 0)
        descriptionParts.push(`Base: ${selectedBase}`);
      if (selectedCrust) descriptionParts.push(`Crust: ${selectedCrust}`);
      const extraToppings = selectedToppings.filter(
        (topping) => !validToppings.includes(topping)
      );

      if (extraToppings.length > 0)
        descriptionParts.push(`Extra Toppings: ${extraToppings.join(", ")}`);
    }

    if (isMeal) {
      descriptionParts.push("MEAL");
      if (selectedDrink) descriptionParts.push(`Drink: ${selectedDrink}`);
    }

    if (reviewNote.trim())
      descriptionParts.push(`Review Note: ${reviewNote.trim()}`);

    const description = descriptionParts.join("\n");

    const cartItem = {
      id: item.id,
      title: item.title,
      image: item.image,
      description,
      itemQuantity: quantity,
      totalPrice: calculatePrice().toFixed(2),
      item_type: "Pizza",
    };

    dispatch(addToCart(cartItem));
    onClose(); // Close modal
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center px-[5%] "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "start",
        paddingLeft: "5%",
        zIndex: "110",
      }}
      transition={{ duration: 0.4 }} // Smooth fade-in/out for backdrop
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-xl w-[100%] lg:w-[60%] relative shadow-xl max-h-[80vh] flex flex-col"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      >
        {/* Modal Header */}
        <div
          className="text-white px-4 lg:px-6 py-1 lg:py-4 flex justify-between items-center rounded-t-xl"
          style={{ backgroundColor: colors.primaryRed }}
        >
          <h2
            className="text-base lg:text-2xl"
            style={{ fontFamily: "Bambino", fontWeight: 650 }}
          >
            ADD ITEM
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 lg:p-4 overflow-y-auto" style={{ flexGrow: 1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-10 gap-4 mb-4">
            <div className="col-span-2">
              <motion.img
                src={item.image}
                alt={item.title}
                className="w-auto h-16 lg:h-80 object-cover mr-4 rounded flex align-middle justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="col-span-8 flex items-center justify-start">
              <div className="grid grid-cols-1">
                <p
                  className="font-semibold text-base lg:text-2xl text-start"
                  style={{ fontFamily: "Bambino", fontWeight: 450 }}
                >
                  {item.title}
                </p>

                {item.Type === "Shawarma" && item.price["naan"] && (
                  <>
                    {/* Pizza Size */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Type
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sizeOptions.map((size) => (
                          <motion.button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${
                              selectedSize === size
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size.toUpperCase()}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {item.Type === "Drinks" &&
                  item.title === "J20 GLASS BOTTLE" && (
                    <>
                      {/* Pizza Size */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                        <div className="col-span-1">
                          <h3
                            className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                            style={{ fontFamily: "Bambino", fontWeight: 350 }}
                          >
                            Flavor
                          </h3>
                        </div>
                        <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                          {flavors.map((flavor) => (
                            <motion.button
                              key={flavor}
                              onClick={() => handleFlavorSelect(flavor)}
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${
                                selectedFlavor === flavor
                                  ? "bg-green-800 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {flavor.toUpperCase()}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                {item.Type === "Shawarma" && item.price["small"] && (
                  <>
                    {/* Pizza Size */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Size
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sizeOptions.map((size) => (
                          <motion.button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${
                              selectedSize === size
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size.toUpperCase()}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {item.Type === "Burgers" && (
                  <>
                    {/* Pizza Size */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Size
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sizeOptions.map((size) => (
                          <motion.button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${
                              selectedSize === size
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size.toUpperCase()}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {/* No Salad & No Sauce */}
                  </>
                )}

                {(item.Type === "Burgers" ||
                  item.Type == "Wraps" ||
                  item.Type == "Shawarma") && (
                  <>
                    {/* Pizza Size */}

                    {/* No Salad & No Sauce */}
                    <div className="col-span-1 flex items-center mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noSalad}
                          onChange={() => setNoSalad(!noSalad)}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${
                            noSalad
                              ? "bg-green-800 border-green-800"
                              : "bg-gray-200 border-gray-400"
                          }`}
                        >
                          {noSalad && <span className="text-white">✔</span>}
                        </div>
                        <span
                          className="text-sm lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          No Salad
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noSauce}
                          onChange={() => setNoSauce(!noSauce)}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${
                            noSauce
                              ? "bg-green-800 border-green-800"
                              : "bg-gray-200 border-gray-400"
                          }`}
                        >
                          {noSauce && <span className="text-white">✔</span>}
                        </div>
                        <span
                          className="text-sm lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          No Sauce
                        </span>
                      </label>
                    </div>
                  </>
                )}
                {item.Type === "Milkshake" && (
                  <div className="col-span-1 flex items-center mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noCream}
                        onChange={() => setNoCream(!noCream)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${
                          noCream
                            ? "bg-green-800 border-green-800"
                            : "bg-gray-200 border-gray-400"
                        }`}
                      >
                        {noCream && <span className="text-white">✔</span>}
                      </div>
                      <span
                        className="text-sm lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        No Cream
                      </span>
                    </label>
                  </div>
                )}

                {(item.Type === "Burgers" ||
                  item.Type == "Wraps" ||
                  item.Type == "Shawarma") && (
                  <>
                    {/* Make it a Meal Checkbox */}
                    <div className="col-span-1 flex items-center mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMeal}
                          onChange={toggleMeal}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${
                            isMeal
                              ? "bg-green-800 border-green-800"
                              : "bg-gray-200 border-gray-400"
                          }`}
                        >
                          {isMeal && <span className="text-white">✔</span>}
                        </div>
                        <span
                          className="text-sm lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Make it a Meal (Chips & Drinks)
                        </span>
                      </label>
                    </div>
                  </>
                )}
                {isMeal && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                    <div className="col-span-1">
                      <h3
                        className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        Drink
                      </h3>
                    </div>
                    <div className="col-span-4 flex flex-wrap justify-start items-center gap-1">
                      {[
                        "Coca Cola",
                        "7Up",
                        "Diet Coca Cola",
                        "Fanta",
                        "Pepsi",
                        "Sprite",
                      ].map((drink) => (
                        <motion.button
                          key={drink}
                          onClick={() => setSelectedDrink(drink)}
                          className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                            selectedDrink === drink
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {drink}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {(item.Type === "Pizza" || item.Type == "GarlicBread") && (
                  <>
                    {/* Pizza Size */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Size
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sizeOptions.map((size) => (
                          <motion.button
                            key={size}
                            onClick={() => handleSizeSelect(size)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${
                              selectedSize === size
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Toppings */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Toppings
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {visibleOptions.map((option) => {
                          const isTopping = toppings.includes(option);
                          const isSelected = isTopping
                            ? selectedToppings.includes(option)
                            : selectedCheeses.includes(option);

                          return (
                            <button
                              key={option}
                              onClick={() =>
                                isTopping
                                  ? handleToppingToggle(option)
                                  : handleCheeseToggle(option)
                              }
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                isSelected
                                  ? "bg-green-800 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Base */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Base
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {bases.map((base) => (
                          <motion.button
                            key={base}
                            onClick={() => handleBaseToggle(base)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded-lg  ${
                              selectedBase.includes(base)
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {base}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Crust */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-sm lg:text-base font-semibold lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Crust
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex justify-start items-center">
                        {crusts.map((crust) => (
                          <motion.button
                            key={crust}
                            onClick={() => handleCrustSelect(crust)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded-lg  ${
                              selectedCrust === crust
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {crust}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Sauce Dips
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sauces.map((sauce) => (
                          <motion.button
                            key={sauce}
                            onClick={() => handleSauceToggle(sauce)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm  transition-colors rounded-lg  ${
                              selectedSauces.includes(sauce)
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {sauce}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* Quantity */}
                <div className="grid grid-cols-1 lg:grid-cols-5 pt-4">
                  <div className="col-span-1">
                    <h3
                      className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                      style={{ fontFamily: "Bambino", fontWeight: 350 }}
                    >
                      Quantity
                    </h3>
                  </div>
                  <div className="col-span-4 flex items-center space-x-2">
                    <motion.button
                      onClick={handleQuantityDecrease}
                      className="px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm bg-gray-300 text-gray-700 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Minus />
                    </motion.button>
                    <span className="text-sm lg:text-base">{quantity}</span>
                    <motion.button
                      onClick={handleQuantityIncrease}
                      className="px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm bg-gray-300 text-gray-700 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                  <div className="col-span-1">
                    <h3
                      className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                      style={{ fontFamily: "Bambino", fontWeight: 350 }}
                    >
                      Review Note
                    </h3>
                  </div>
                  <div className="col-span-4">
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Write any special instructions or notes..."
                      rows={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-200 px-4 lg:px-6 py-2 lg:py-4 flex justify-between items-center rounded-b-xl">
          <div className="text-sm lg:text-lg font-semibold">
            Total: £{(calculatePrice() * quantity).toFixed(2)}
          </div>
          <div>
            <motion.button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 text-sm lg:text-base px-1 lg:px-4 py-2 lg:py-2 rounded mr-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontFamily: "Bambino", fontWeight: 450 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleAddToCart}
              className="text-white px-2 lg:px-4 py-1 lg:py-1 rounded text-sm lg:text-base"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                fontFamily: "Bambino",
                fontWeight: 450,
                backgroundColor: colors.primaryGreen,
              }}
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CartModal;
