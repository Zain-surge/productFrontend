import React, { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion"; // Import Framer Motion

import { Minus, Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { ChevronDown, ChevronUp } from "lucide-react";
import { colors } from "../colors";
import { getMenuItemImage } from "./menuItemImageMapping";
import { useSelector } from "react-redux";

const CartModal = ({ isOpen, onClose, item }) => {
  const sizeOptions = Object.keys(item.price);
  // Extract pre-defined items from item prop if they exist
  const preSelectedToppings = item.toppings || [];
  const preSelectedSauces = item.sauces || [];
  const preSelectedCheeses = item.cheese || [];
  const [expanded, setExpanded] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [selectedShawarmas, setSelectedShawarmas] = useState([]);

  const [selectedPizzas, setSelectedPizzas] = useState([]);
  const [availablePizzas, setAvailablePizzas] = useState([]);

  // Add this line to get menuItems from Redux
  const menuItems = useSelector((state) => state.menuItems.items);

  const sauces = [
    "Mayo",
    "Ketchup",
    "Chilli sauce",
    "Sweet chilli",
    "Garlic Sauce",
    "BBQ Sauce",
    "Mint Sauce"
  ];

  const salads = [
    "Cucumber",
    "Lettuce",
    "Onions",
    "Tomato",
    "Cabbage"
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
    "Donner",
    "Shawarma"
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

  const [selectedSize, setSelectedSize] = useState("");
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

  const [selectedSalads, setSelectedSalads] = useState([]);

  // 2. Add handleSaladToggle function (add this near other handler functions)
  const handleSaladToggle = (salad) => {
    setSelectedSalads((prev) =>
      prev.includes(salad) ? prev.filter((s) => s !== salad) : [...prev, salad]
    );
  };

  const [selectedComboItems, setSelectedComboItems] = useState({
    pizza: null,
    shawarma: null,
    burger: null,
    calzone: null
  });

  const [availableShawarmas, setAvailableShawarmas] = useState([]);
  const [availableBurgers, setAvailableBurgers] = useState([]);
  const [availableCalzones, setAvailableCalzones] = useState([]);
  const [comboNoSalad, setComboNoSalad] = useState(false);
  const [comboNoSauce, setComboNoSauce] = useState(false);
  const [comboSelectedSauces, setComboSelectedSauces] = useState([]);

  const [validationErrors, setValidationErrors] = useState([]);

  const [selectedDrink, setSelectedDrink] = useState("");
  const [selectedseasoning, setSelectedseasoning] = useState("");// if meal is selected

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

  useEffect(() => {
    if (item.Type === "Deals" && item.title === "Pizza Offers") {
      // Get unique pizzas from menuItems
      const uniquePizzas = menuItems
        .filter(menuItem => (menuItem.Type === "Pizza" || menuItem.Type === "GarlicBread") && menuItem.availability === true && menuItem.website === true)
        .reduce((acc, current) => {
          const existing = acc.find(pizza => pizza.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

      setAvailablePizzas(uniquePizzas);
    }
    if (item.Type === "Deals" && item.title === "Shawarma Deal") {
      // Get unique shawarmas for Shawarma Deal
      const uniqueShawarmas = menuItems
        .filter(menuItem => menuItem.Type === "Shawarma" && menuItem.availability === true && menuItem.subType === "Donner & Shawarma kebab")
        .reduce((acc, current) => {
          const existing = acc.find(shawarma => shawarma.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

      setAvailableShawarmas(uniqueShawarmas);
    }

    if (item.Type === "Deals" && (item.title === "Combo Meal" || item.title === "Family Meal")) {
      // Get unique pizzas
      const uniquePizzas = menuItems
        .filter(menuItem => menuItem.Type === "Pizza" && menuItem.availability === true)
        .reduce((acc, current) => {
          const existing = acc.find(pizza => pizza.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

      // Get unique shawarmas
      const uniqueShawarmas = menuItems
        .filter(menuItem => menuItem.Type === "Shawarma" && menuItem.availability === true && menuItem.subType === "Donner & Shawarma kebab")
        .reduce((acc, current) => {
          const existing = acc.find(shawarma => shawarma.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

      // Get unique burgers
      const uniqueBurgers = menuItems
        .filter(menuItem => menuItem.Type === "Burgers" && menuItem.availability === true)
        .reduce((acc, current) => {
          const existing = acc.find(burger => burger.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);
      const uniqueCalzones = menuItems
        .filter(menuItem => menuItem.Type === "Calzones" && menuItem.availability === true)
        .reduce((acc, current) => {
          const existing = acc.find(burger => burger.title === current.title);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);


      setAvailablePizzas(uniquePizzas);
      setAvailableShawarmas(uniqueShawarmas);
      setAvailableBurgers(uniqueBurgers);
      setAvailableCalzones(uniqueCalzones);
    }
  }, [menuItems, item]);
  const handleComboItemSelect = (type, item) => {
    setSelectedComboItems(prev => ({
      ...prev,
      [type]: item
    }));

    // Clear validation errors when user makes selection
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleComboSauceToggle = (sauce) => {
    setComboSelectedSauces(prev =>
      prev.includes(sauce) ? prev.filter(s => s !== sauce) : [...prev, sauce]
    );
  };

  const handleShawarmaToggle = (shawarma) => {
    setSelectedShawarmas(prev => {
      const isSelected = prev.some(s => s.id === shawarma.id);

      if (isSelected) {
        // Remove shawarma
        return prev.filter(s => s.id !== shawarma.id);
      } else if (prev.length < 4) {
        // Add shawarma (max 4)
        return [...prev, shawarma];
      }
      return prev; // Don't add if already have 4
    });

    // Clear validation errors when user makes selection
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handlePizzaSelect = (pizza, index) => {
    setSelectedPizzas(prev => {
      const updated = [...prev];

      // Make sure array has exactly 3 slots
      while (updated.length < 3) {
        updated.push(null);
      }

      // Replace the pizza at the given index
      updated[index] = pizza;

      return updated;
    });

    // Clear validation errors when user makes selection
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };


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
      // Check if items are pre-selected (from the original item)
      const aIsPreSelected = toppings.includes(a)
        ? preSelectedToppings.includes(a)
        : preSelectedCheeses.includes(a);

      const bIsPreSelected = toppings.includes(b)
        ? preSelectedToppings.includes(b)
        : preSelectedCheeses.includes(b);

      // Only sort by pre-selected items, not currently selected items
      if (aIsPreSelected && !bIsPreSelected) return -1;
      if (!aIsPreSelected && bIsPreSelected) return 1;
      return 0;
    });
  };
  // Get the specific image for this menu item using your mapping
  const itemImage = getMenuItemImage(item.title, item.image);

  const sortedOptions = getSortedOptions();
  const visibleOptions = sortedOptions;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
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
    let basePrice = 0;
    if (
      item.Type == "Pizza" ||
      item.Type == "Burgers" ||
      item.Type == "Shawarma" ||
      item.Type == "GarlicBread" ||
      (item.Type == "Deals" && item.title == "Pizza Offers")
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
      else if (selectedSize === "16 inch") crustPrice = 3.5;
      else if (selectedSize === "12 inch") crustPrice = 2.5;
      else if (selectedSize === "18 inch") crustPrice = 4.5;
    }
    if (item.title === 'CREATE YOUR OWN' && selectedToppings.length + selectedCheeses.length > 4) {

      if (selectedSize === "10 inch")
        toppingsPrice = 1.0 * (selectedToppings.length + selectedCheeses.length - 4);
      else if (selectedSize === "12 inch")
        toppingsPrice = 1.5 * (selectedToppings.length + selectedCheeses.length - 4);
      else if (selectedSize === "16 inch")
        toppingsPrice = 2.5 * (selectedToppings.length + selectedCheeses.length - 4);
      else if (selectedSize === "18 inch")
        toppingsPrice = 3.5 * (selectedToppings.length + selectedCheeses.length - 4);
    }
    if (
      selectedToppings.length > 0 &&
      selectedToppings.length != validToppings.length && item.title != 'CREATE YOUR OWN'
    ) {
      if (selectedSize === "10 inch")
        toppingsPrice = 1.0 * (selectedToppings.length - validToppings.length);
      else if (selectedSize === "12 inch")
        toppingsPrice = 1.5 * (selectedToppings.length - validToppings.length);
      else if (selectedSize === "16 inch")
        toppingsPrice = 2.5 * (selectedToppings.length - validToppings.length);
      else if (selectedSize === "18 inch")
        toppingsPrice = 3.5 * (selectedToppings.length - validToppings.length);
    }

    if (
      selectedCheeses.length > 0 &&
      selectedCheeses.length != validCheese.length && item.title != 'CREATE YOUR OWN'
    ) {
      if (selectedSize === "10 inch")
        cheesePrice = 1.0 * (selectedCheeses.length - validCheese.length);
      else if (selectedSize === "12 inch")
        cheesePrice = 1.5 * (selectedCheeses.length - validCheese.length);
      else if (selectedSize === "16 inch")
        cheesePrice = 2.5 * (selectedCheeses.length - validCheese.length);
      else if (selectedSize === "18 inch")
        cheesePrice = 3.5 * (selectedCheeses.length - validCheese.length);
    }
    if (selectedBase.includes("BBQ")) {
      if (selectedSize === "10 inch") basesPrice += 0.99;
      else if (selectedSize === "12 inch") basesPrice += 1.5;
      else if (selectedSize === "16 inch") basesPrice += 2.99;
      else if (selectedSize === "18 inch") basesPrice += 4.0;
    }

    if (selectedBase.includes("Garlic")) {
      if (selectedSize === "10 inch") basesPrice += 0.99;
      else if (selectedSize === "12 inch") basesPrice += 1.5;
      else if (selectedSize === "16 inch") basesPrice += 2.99;
      else if (selectedSize === "18 inch") basesPrice += 4.0;
    }

    if (isMeal) {
      mealPrice = 1.9;
    }
    const extraSauces = selectedSauces.filter(
      (sauce) => !preSelectedSauces.includes(sauce)
    );
    extraSauces.forEach((sauce) => {
      if (item.Type == "Pizza" || item.Type == 'GarlicBread') {
        if (["Garlic Sauce", "Chilli sauce"].includes(sauce)) {
          saucePrice += 0.75;
        } else {
          saucePrice += 0.5;
        }
      }

    });

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
  const [shawarmaChoices, setShawarmaChoices] = useState(
    Array.from({ length: 4 }, () => ({ salad: false, sauce: false, sauces: [] }))
  );

  const updateShawarmaChoice = (index, changes) => {
    setShawarmaChoices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...changes };
      return updated;
    });
  };

  const toggleShawarmaSauce = (index, sauce) => {
    setShawarmaChoices((prev) => {
      const updated = [...prev];
      const currentSauces = updated[index].sauces || [];
      updated[index] = {
        ...updated[index],
        sauces: currentSauces.includes(sauce)
          ? currentSauces.filter((s) => s !== sauce)
          : [...currentSauces, sauce],
      };
      return updated;
    });
  };


  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
  const validateSelection = () => {
    const errors = [];

    if ((item.Type === "Pizza" || item.Type === "Burgers" || (item.Type === "Shawarma" && item.subType === "Shawarma & kebab trays") || item.Type === "GarlicBread") && !selectedSize) {
      errors.push("Please select a size");
    }


    if (item.Type === "Shawarma" && item.price["naan"] && !selectedSize) {
      errors.push("Please select a type");
    }
    if (item.Type === "Deals" && item.title === "Pizza Offers") {
      if (selectedPizzas.length !== 3) {
        errors.push("Please select exactly 3 pizzas");
      }
      if (!selectedSize) {
        errors.push("Please select a size");
      }
    }

    if (item.Type === "Deals" && (item.title === "Combo Meal" || item.title === "Family Meal")) {
      if (!selectedComboItems.pizza) {
        errors.push("Please select a pizza");
      }
      // if (!selectedComboItems.shawarma) {
      //   errors.push("Please select a shawarma");
      // }
      if (!selectedComboItems.burger) {
        errors.push("Please select a burger");
      }
      if (!selectedComboItems.calzone && item.title === "Family Meal") {
        errors.push("Please select a calzone");
      }


    }

    return errors;
  };

  const handleAddToCart = () => {
    const errors = validateSelection();

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    const descriptionParts = [];

    if (selectedSize) descriptionParts.push(`Size: ${selectedSize}`);
    if (item.Type === "Burgers" || item.Type === "Shawarma" || item.Type === "Wraps") {
      if (noSalad) descriptionParts.push("No Salad");
      if (noSauce) descriptionParts.push("No Sauce");
    }
    if (item.Type === "Milkshake" && noCream) {
      descriptionParts.push("No Cream");
    }
    // In handleAddToCart function, after the existing descriptionParts logic, add:

    if (item.Type === "Deals" && item.title === "Pizza Offers") {
      descriptionParts.push(`Selected Pizzas: ${selectedPizzas.map(p => p.title).join(", ")}`);
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
      if (selectedseasoning) descriptionParts.push(`Seasoning: ${selectedseasoning}`);
    }

    if (selectedSauces.length > 0 && item.Type == "Pizza") {
      descriptionParts.push(`Sauce Dips: ${selectedSauces.join(", ")}`);
    }
    if (selectedSauces.length > 0 && (item.Type === "Burgers" || item.Type === "Shawarma" || item.Type === "Wraps")) {
      descriptionParts.push(`Sauces: ${selectedSauces.join(", ")}`);
    }
    if (selectedSalads.length > 0 && (item.Type === "Burgers" || item.Type === "Shawarma" || item.Type === "Wraps")) {
      descriptionParts.push(`Salads: ${selectedSalads.join(", ")}`);
    }

    // In handleAddToCart function, after the existing descriptionParts logic, add:

    if (item.Type === "Deals" && (item.title === "Combo Meal" || item.title === "Family Meal")) {
      if (selectedComboItems.pizza) descriptionParts.push(`Pizza: ${selectedComboItems.pizza.title}`);
      if (selectedComboItems.shawarma) descriptionParts.push(`Shawarma: ${selectedComboItems.shawarma.title}`);
      if (selectedComboItems.burger) descriptionParts.push(`Burger: ${selectedComboItems.burger.title}`);
      if (selectedComboItems.calzone) descriptionParts.push(`Calzone: ${selectedComboItems.calzone.title}`);

      if (comboNoSalad) descriptionParts.push("No Salad");
      if (comboNoSauce) descriptionParts.push("No Sauce");
      if (comboSelectedSauces.length > 0) descriptionParts.push(`Sauces: ${comboSelectedSauces.join(", ")}`);
    }

    if (item.Type === "Deals" && item.title === "Shawarma Deal") {
      descriptionParts.push(
        `Selected Shawarmas: ${shawarmaChoices
          .map((s, idx) => {
            const saladText = s.salad ? "No Salad" : "Salad";
            const sauceText = s.sauce
              ? "No Sauce"
              : s.sauces.length > 0
                ? `Sauce: ${s.sauces.join(", ")}`
                : "Sauce";
            return `Shawarma ${idx + 1} (${saladText}, ${sauceText})`;
          })
          .join("\n ")}`
      );
    }
    if (item.Type == "Deals" && item.title != "Pizza Offers") {
      if (selectedseasoning) descriptionParts.push(`Seasoning: ${selectedseasoning}`);
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
                src={itemImage}
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
                {item.Type === "Deals" && item.title === "Shawarma Deal" && (
                  <>
                    <h3
                      className="text-base lg:text-lg font-semibold mb-2"
                      style={{ fontFamily: "Bambino", fontWeight: 350 }}
                    >
                      Select 4 Shawarmas
                    </h3>

                    <div className="flex flex-col gap-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                        >
                          <h4
                            className="text-sm font-semibold mb-2"
                            style={{ fontFamily: "Bambino" }}
                          >
                            Shawarma {index + 1}
                          </h4>

                          {/* Salad */}
                          <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                            <div className="col-span-1">
                              <h5 className="text-sm font-medium py-1">Salad</h5>
                            </div>
                            <div className="col-span-1 lg:col-span-4 flex gap-1">
                              {[
                                { label: "Yes", value: false },
                                { label: "No", value: true },
                              ].map((option) => (
                                <motion.button
                                  key={option.label}
                                  onClick={() =>
                                    updateShawarmaChoice(index, { salad: option.value })
                                  }
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${shawarmaChoices[index]?.salad === option.value
                                    ? "bg-green-800 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {option.label}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Sauce Yes/No */}
                          <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                            <div className="col-span-1">
                              <h5 className="text-sm font-medium py-1">Sauce</h5>
                            </div>
                            <div className="col-span-1 lg:col-span-4 flex gap-1">
                              {[
                                { label: "Yes", value: false },
                                { label: "No", value: true },
                              ].map((option) => (
                                <motion.button
                                  key={option.label}
                                  onClick={() =>
                                    updateShawarmaChoice(index, {
                                      sauce: option.value,
                                      sauces: option.value ? [] : shawarmaChoices[index]?.sauces,
                                    })
                                  }
                                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${shawarmaChoices[index]?.sauce === option.value
                                    ? "bg-green-800 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {option.label}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Sauce options if Yes */}
                          {shawarmaChoices[index]?.sauce === false && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                              <div className="col-span-1">
                                <h5 className="text-sm font-medium py-1">Sauces</h5>
                              </div>
                              <div className="col-span-1 lg:col-span-4 flex flex-wrap gap-1">
                                {sauces.map((sauce) => (
                                  <motion.button
                                    key={sauce}
                                    onClick={() => toggleShawarmaSauce(index, sauce)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${shawarmaChoices[index]?.sauces?.includes(sauce)
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
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {item.Type === "Deals" && (item.title === "Combo Meal" || item.title === "Family Meal") && (
                  <>
                    {/* Pizza Selection for Combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2 border rounded-lg p-3 bg-gray-50 shadow-sm mb-2">

                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Select 1 Pizza
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 ">
                        {availablePizzas.map((pizza) => (
                          <motion.button
                            key={pizza.id}
                            onClick={() => handleComboItemSelect('pizza', pizza)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${selectedComboItems.pizza?.id === pizza.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pizza.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Shawarma Selection for Combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2 border rounded-lg p-3 bg-gray-50 shadow-sm mb-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          CHICKEN SHAWARMA
                        </h3>
                      </div>
                      {/* <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 max-h-32 overflow-y-auto">
                        {availableShawarmas.map((shawarma) => (
                          <motion.button
                            key={shawarma.id}
                            onClick={() => handleComboItemSelect('shawarma', shawarma)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${selectedComboItems.shawarma?.id === shawarma.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {shawarma.title}
                          </motion.button>
                        ))}
                      </div> */}
                    </div>

                    {/* Burger Selection for Combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2 border rounded-lg p-3 bg-gray-50 shadow-sm mb-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Select 1 Burger
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 max-h-32 overflow-y-auto">
                        {availableBurgers.map((burger) => (
                          <motion.button
                            key={burger.id}
                            onClick={() => handleComboItemSelect('burger', burger)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${selectedComboItems.burger?.id === burger.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {burger.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {item.Type === "Deals" && item.title === "Family Meal" && (

                      <div className="grid grid-cols-1 lg:grid-cols-5 pt-2 border rounded-lg p-3 bg-gray-50 shadow-sm mb-2">
                        <div className="col-span-1">
                          <h3
                            className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                            style={{ fontFamily: "Bambino", fontWeight: 350 }}
                          >
                            Select 1 Calzone
                          </h3>
                        </div>
                        <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1 max-h-32 overflow-y-auto">
                          {availableCalzones.map((calzone) => (
                            <motion.button
                              key={calzone.id}
                              onClick={() => handleComboItemSelect('calzone', calzone)}
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${selectedComboItems.calzone?.id === calzone.id
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {calzone.title}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}


                    {/* Size Selection for Combo Meal */}


                    {/* Salad Options for Combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">

                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Salad
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {[
                          { label: "Yes", value: false },
                          { label: "No", value: true }
                        ].map((option) => (
                          <motion.button
                            key={option.label}
                            onClick={() => setComboNoSalad(option.value)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${comboNoSalad === option.value
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Sauce Options for Combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Sauce
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {[
                          { label: "Yes", value: false },
                          { label: "No", value: true }
                        ].map((option) => (
                          <motion.button
                            key={option.label}
                            onClick={() => {
                              setComboNoSauce(option.value);
                              // Clear selected sauces when "No" is selected
                              if (option.value === true) {
                                setComboSelectedSauces([]);
                              }
                            }}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${comboNoSauce === option.value
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Sauce Selection for Combo (only if sauce = Yes) */}
                    {comboNoSauce === false && (
                      <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                        <div className="col-span-1">
                          <h3
                            className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                            style={{ fontFamily: "Bambino", fontWeight: 350 }}
                          >
                            Sauces
                          </h3>
                        </div>
                        <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                          {sauces.map((sauce) => (
                            <motion.button
                              key={sauce}
                              onClick={() => handleComboSauceToggle(sauce)}
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${comboSelectedSauces.includes(sauce)
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
                    )}

                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {item.Type === "Deals" && item.title === "Pizza Offers" && (
                  <>
                    {/* Size Selection at the top */}
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
                            className={`px-2 lg:px-4 py-1 text-sm rounded-lg transition-colors ${selectedSize === size
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

                    {/* Pizza 1 */}
                    <div className="border rounded-lg p-3 bg-gray-50 shadow-sm mt-3">
                      <h3
                        className="text-base lg:text-base font-semibold mb-2 flex justify-start items-center"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        Select Pizza 1
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {availablePizzas.map((pizza) => (
                          <motion.button
                            key={"pizza1-" + pizza.id}
                            onClick={() => handlePizzaSelect(pizza, 0)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPizzas[0]?.id === pizza.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pizza.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Pizza 2 */}
                    <div className="border rounded-lg p-3 bg-gray-50 shadow-sm mt-3">
                      <h3
                        className="text-base lg:text-base font-semibold mb-2 flex justify-start items-center"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        Select Pizza 2
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {availablePizzas.map((pizza) => (
                          <motion.button
                            key={"pizza2-" + pizza.id}
                            onClick={() => handlePizzaSelect(pizza, 1)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPizzas[1]?.id === pizza.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pizza.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Pizza 3 */}
                    <div className="border rounded-lg p-3 bg-gray-50 shadow-sm mt-3">
                      <h3
                        className="text-base lg:text-base font-semibold mb-2 flex justify-start items-center"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        Select Pizza 3
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {availablePizzas.map((pizza) => (
                          <motion.button
                            key={"pizza3-" + pizza.id}
                            onClick={() => handlePizzaSelect(pizza, 2)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPizzas[2]?.id === pizza.id
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pizza.title}
                          </motion.button>
                        ))}
                      </div>
                    </div>


                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}




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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${selectedSize === size
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
                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
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
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${selectedFlavor === flavor
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${selectedSize === size
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
                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${selectedSize === size
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
                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                    {/* No Salad & No Sauce */}
                  </>
                )}

                {(item.Type === "Burgers" ||
                  item.Type == "Wraps" ||
                  item.Type == "Shawarma") && (
                    <>
                      {/* Pizza Size */}

                      {/* No Salad & No Sauce */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                        <div className="col-span-1">
                          <h3
                            className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                            style={{ fontFamily: "Bambino", fontWeight: 350 }}
                          >
                            Salad
                          </h3>
                        </div>
                        <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                          {[
                            { label: "Yes", value: false },
                            { label: "No", value: true }
                          ].map((option) => (
                            <motion.button
                              key={option.label}
                              onClick={() => {
                                setNoSalad(option.value);
                                // Clear selected sauces when "No" is selected
                                if (option.value === true) {
                                  setSelectedSalads([]);
                                }
                              }}
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${noSalad === option.value
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {option.label}
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
                            Sauce
                          </h3>
                        </div>
                        <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                          {[
                            { label: "Yes", value: false },
                            { label: "No", value: true }
                          ].map((option) => (
                            <motion.button
                              key={option.label}
                              onClick={() => {
                                setNoSauce(option.value);
                                // Clear selected sauces when "No" is selected
                                if (option.value === true) {
                                  setSelectedSauces([]);
                                }
                              }}
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg ${noSauce === option.value
                                ? "bg-green-800 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                    </>
                  )}
                {
                  noSauce === false && (item.Type == "Shawarma" || item.Type == "Burgers" || item.Type == "Wraps") && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Sauces
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {sauces.map((sauce) => (
                          <motion.button
                            key={sauce}
                            onClick={() => handleSauceToggle(sauce)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm  transition-colors rounded-lg  ${selectedSauces.includes(sauce)
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
                  )
                }

                {
                  noSalad === false && (item.Type == "Shawarma" || item.Type == "Burgers" || item.Type == "Wraps") && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                      <div className="col-span-1">
                        <h3
                          className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                          style={{ fontFamily: "Bambino", fontWeight: 350 }}
                        >
                          Salads
                        </h3>
                      </div>
                      <div className="col-span-1 lg:col-span-4 flex flex-wrap justify-start items-center gap-1">
                        {salads.map((salad) => (
                          <motion.button
                            key={salad}
                            onClick={() => handleSaladToggle(salad)}
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm  transition-colors rounded-lg  ${selectedSalads.includes(salad)
                              ? "bg-green-800 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {salad}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                }

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
                        className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${noCream
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
                  item.Type == "Shawarma" ||
                  item.Type == "Pizza") && (
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
                            className={`w-5 h-5 flex justify-center items-center border rounded transition-colors ${isMeal
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
                {(isMeal || item.Type == 'KidsMeal') && (
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
                        "Irn Bru",
                        "Caprisun", "Rubicon Mango", "Water"

                      ].map((drink) => (
                        <motion.button
                          key={drink}
                          onClick={() => setSelectedDrink(drink)}
                          className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded transition-all duration-200 transform hover:scale-105 active:scale-95 ${selectedDrink === drink
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

                {(isMeal || item.Type == 'KidsMeal' || (item.Type == 'Deals' && item.title != 'Pizza Offers') || item.title.includes('CHIPS')) && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 pt-2">
                    <div className="col-span-1">
                      <h3
                        className="text-base lg:text-base font-semibold mb-1 lg:mb-2 flex justify-start items-center py-1"
                        style={{ fontFamily: "Bambino", fontWeight: 350 }}
                      >
                        Chips Seasoning
                      </h3>
                    </div>
                    <div className="col-span-4 flex flex-wrap justify-start items-center gap-1">
                      {[
                        "Red Salt",
                        "White Salt",
                        "Vinegar",
                        "Salt and Vinegar"

                      ].map((seasoning) => (
                        <motion.button
                          key={seasoning}
                          onClick={() => setSelectedseasoning(seasoning)}
                          className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded transition-all duration-200 transform hover:scale-105 active:scale-95 ${selectedseasoning === seasoning
                            ? "bg-green-800 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {seasoning}
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm transition-colors rounded-lg  ${selectedSize === size
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
                    {validationErrors.length > 0 && (
                      <div className="col-span-full mb-2">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-red-600 text-sm font-medium">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}

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
                              className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded transition-all duration-200 transform hover:scale-105 active:scale-95 ${isSelected
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded-lg  ${selectedBase.includes(base)
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm rounded-lg  ${selectedCrust === crust
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
                            className={`px-2 lg:px-4 py-1 lg:py-1 text-sm lg:text-sm  transition-colors rounded-lg  ${selectedSauces.includes(sauce)
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
