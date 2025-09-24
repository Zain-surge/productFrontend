import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { addToCart } from "../store/cartSlice";
import {
  updateItemQuantity,
  removeFromCart,
  clearCart,
} from "../store/cartSlice";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import axiosInstance from "../axiosInstance";
import { colors } from "../colors";
import { useSelector, useDispatch } from "react-redux";
import logo from "../images/tvpLogo.png";
import basket from "../images/basket.png";
import { getMenuItemImage } from "./menuItemImageMapping"; // Import your mapping function


const pageVariants = {
  initial: { opacity: 0, x: "100%" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "-100%" },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (custom) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.1,
      type: "spring",
      stiffness: 100,
    },
  }),
};

const Cart = ({ isOpen, onClose }) => {
  const menuItems = useSelector((state) => state.menuItems.items);
  const location = useLocation();
  const shouldRenderCart = location.pathname === "/";
  const [checkoutStage, setCheckoutStage] = useState("cart");

  const offers = useSelector((state) => state.offers.list);



  const user = useSelector((state) => state.user?.user?.userDetails);
  const [formData, setFormData] = useState({
    name: user ? user.name : "",
    email: user ? user.email : "",
    phone: user ? user.phone_number : "",
    address: {
      street: user ? user.street_address : "",
      city: user ? user.city : "",
      state: user ? user.county : "",
      zipCode: user ? user.postal_code : "",
    },
    deliveryOption: "delivery",
    paymentOption: "Card",
    reviewNotes: "",
  });
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [places, setPlaces] = useState({});

  const [postalCodes, setPostalCodes] = useState([]);
  const [filteredPostalCodes, setFilteredPostalCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [streets, setStreets] = useState([]);
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [isStreetDropdownOpen, setIsStreetDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchNearbyPostcodes = async () => {
      try {
        // Call your backend API to get postcodes
        const response = await axiosInstance.get("/admin/postcodes");

        // Extract postcodes and create places object with streets
        const codes = response.data?.rows?.map((row) => row.postcode) || [];
        const placesWithStreets = response.data?.rows?.reduce((acc, row) => {
          acc[row.postcode] = row.streets || [];
          return acc;
        }, {}) || {};

        setPostalCodes(codes);
        setFilteredPostalCodes(codes);
        setPlaces(placesWithStreets);
      } catch (error) {
        console.error("Error fetching postcodes:", error.message);
      }
    };

    fetchNearbyPostcodes();
  }, []);

  useEffect(() => {
    if (formData.address.zipCode && places[formData.address.zipCode]) {
      const availableStreets = places[formData.address.zipCode] || [];
      setStreets(availableStreets);
      setFilteredStreets(availableStreets);
    } else {
      setStreets([]);
      setFilteredStreets([]);
    }
    // Clear street address when postcode changes
    if (formData.address.street && !streets.includes(formData.address.street)) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          street: ""
        }
      }));
    }
  }, [formData.address.zipCode, places]);


  useEffect(() => {
    const normalizedSearch = search.replace(/\s/g, "").toLowerCase();
    const filtered = postalCodes.filter((code) =>
      code.replace(/\s/g, "").toLowerCase().includes(normalizedSearch)
    );
    setFilteredPostalCodes(filtered);
  }, [search, postalCodes]);

  const stripe = useStripe();
  const elements = useElements();

  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const totalPrice = cart.reduce(
    (total, item) => total + parseFloat(item.totalPrice * item.itemQuantity),
    0
  );
  const deliveryFee = formData.deliveryOption === "delivery" ? 1.5 : 0;

  // Add this after the existing totalPrice calculation
  const { discountAmount, discountedTotal, finalDeliveryFee, activeOffer, appliedOffers } = useMemo(() => {
    const activeOffers = offers?.filter(offer => offer.value === true) || [];

    let bestDiscount = 0;
    let bestOffer = null;
    let finalDeliveryFee = deliveryFee;
    let appliedOffers = [];

    activeOffers.forEach(offer => {
      const isDeliveryFreeOffer = offer.offer_text.toLowerCase().includes('free delivery');
      const isPercentageOffer = offer.offer_text.match(/(\d+)% OFF/);

      if (isDeliveryFreeOffer) {
        const minAmount = parseFloat(offer.offer_text.match(/£(\d+)/)?.[1] || 0);
        if (totalPrice >= minAmount) {
          const deliverySaving = deliveryFee;
          if (deliverySaving > bestDiscount) {
            bestDiscount = deliverySaving;
            bestOffer = offer;
            finalDeliveryFee = 0;
          }
        }
      } else if (isPercentageOffer) {
        const percentage = parseInt(isPercentageOffer[1]);
        const minAmount = parseFloat(offer.offer_text.match(/£(\d+)/)?.[1] || 0);
        if (totalPrice >= minAmount || minAmount === 0) {
          const discount = (totalPrice * percentage) / 100;
          if (discount > bestDiscount) {
            bestDiscount = discount;
            bestOffer = offer;
            finalDeliveryFee = deliveryFee; // Reset delivery fee
          }
        }
      }
    });

    const discountedTotal = bestOffer?.offer_text.toLowerCase().includes('free delivery')
      ? totalPrice
      : totalPrice - bestDiscount;

    appliedOffers = bestOffer ? [bestOffer] : [];

    return {
      discountAmount: bestOffer?.offer_text.toLowerCase().includes('free delivery') ? 0 : bestDiscount,
      discountedTotal,
      finalDeliveryFee,
      activeOffer: bestOffer,
      appliedOffers
    };
  }, [offers, totalPrice, deliveryFee]);

  const finalTotal = discountedTotal + finalDeliveryFee;
  const handleIncreaseQuantity = (title) => {
    dispatch(updateItemQuantity({ title: title, change: 1 }));
  };

  const handleDecreaseQuantity = (title, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateItemQuantity({ title: title, change: -1 }));
    }
  };

  const handleRemoveItem = (title) => {
    dispatch(removeFromCart(title));
  };
  const handleAddSideOrder = (item) => {
    dispatch(
      addToCart({
        id: item.id,
        title: item.title,
        description: item.description || "",
        totalPrice: item.price.default,
        image: item.image,
        itemQuantity: 1,
      })
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "deliveryOption" && value === "pickup") {
      setFormData((prev) => ({
        ...prev,
        deliveryOption: "pickup",
        paymentOption: "Cash on Pickup", // Force to COD when pickup
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
      }));
      return;
    }
    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setFormError("");

    if (isSubmittingRef.current) return;

    // Validation
    if (checkoutStage === "customer-info" && formData.deliveryOption === "delivery" && totalPrice < 8.5) {
      setFormError("Cannot place a delivery order less than £8.50.");
      return;
    }
    const normalizedPostalCodes = postalCodes.map(code => code.replace(/\s/g, "").toLowerCase());
    const normalizedInput = formData.address.zipCode.replace(/\s/g, "").toLowerCase();

    if (
      checkoutStage === "customer-info" &&
      formData.deliveryOption === "delivery" &&
      !normalizedPostalCodes.includes(normalizedInput)
    ) {
      setFormError("Invalid postal code. Please select from the dropdown.");
      return;
    }

    // Handle different checkout stages
    if (checkoutStage === "customer-info") {
      if (formData.paymentOption === "Card") {
        setCheckoutStage("payment");
        return;
      } else {
        // Process non-online payment order
        isSubmittingRef.current = true;
        try {
          await processOrderWithFullCreate(null);
        } finally {

        }
      }
    } else if (checkoutStage === "payment") {
      // Process online payment
      await processStripePayment();
    } else if (checkoutStage === "confirmation") {
      // Complete checkout
      dispatch(clearCart());
      setCheckoutStage("cart");
    }
  };

  const processStripePayment = async () => {
    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create Payment Intent
      const { data } = await axiosInstance.post("/payment/create-payment-intent", {
        amount: finalTotal,
        customerInfo: formData,
        cartItems: cart,
      });

      if (!data.clientSecret) {
        throw new Error("Failed to retrieve client secret from Stripe.");
      }

      // Step 2: Confirm Payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address.street,
              city: formData.address.city,
              state: formData.address.state,
              postal_code: formData.address.zipCode,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || "Payment confirmation failed.");
      }

      // Step 3: Create order with Stripe transaction ID
      await processOrderWithFullCreate(result.paymentIntent.id);
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const processOrderWithFullCreate = async (stripeTransactionId) => {
    try {
      // Generate transaction ID for non-online payments
      const transactionId = stripeTransactionId || Math.floor(100000000000 + Math.random() * 900000000000).toString();

      // Prepare guest data (only if user is not logged in)
      const guestData = !user ? {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        street_address: formData.address.street,
        city: formData.address.city,
        county: "",
        postal_code: formData.address.zipCode,
      } : null;

      // Prepare items array matching the API structure
      const orderItems = cart.map(item => ({
        item_id: item.id,
        quantity: item.itemQuantity,
        description: item.description || "",
        total_price: item.totalPrice,
      }));

      // Prepare full order data matching existing API
      const orderData = {
        user_id: user?.user_id || null,
        guest: guestData,
        transaction_id: transactionId,
        payment_type: formData.paymentOption,
        order_type: formData.deliveryOption,
        total_price: finalTotal,
        extra_notes: formData.extraNotes || "",
        status: "yellow",
        order_source: "Website",
        change_due: 0,
        discount: (activeOffer && discountAmount > 0) ? discountAmount : 0,
        items: orderItems,
        paid_status: (formData.paymentOption === "Cash on Delivery" || formData.paymentOption === "Cash on PickUp") ? false : true,
      };


      // Call the existing full-create endpoint
      const orderResponse = await axiosInstance.post("/orders/full-create", orderData);

      if (orderResponse.data && orderResponse.data.order_id) {
        isSubmittingRef.current = false;
        setCheckoutStage("confirmation");
      } else {
        throw new Error("Failed to create order - no order_id returned.");
      }
    } catch (error) {
      console.error("Order creation error:", error);

      // Provide appropriate error message based on payment status
      let errorMessage = "Order creation failed. Please try again.";
      if (stripeTransactionId) {
        errorMessage = "Payment was successful, but order creation failed. Please contact support with transaction ID: " + stripeTransactionId;
      }

      // Check if it's a specific API error
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
    }
  };


  const INTERVAL = 3000; // 2 seconds
  const sides = menuItems?.filter((item) => ["Sides", "Drinks"].includes(item.Type)) || [];
  const [index, setIndex] = useState(0);
  const itemRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    if (itemRef.current) {
      setItemWidth(itemRef.current.offsetWidth + 16); // 16 for gap-4 (approx.)
    }
  }, [itemRef.current]);

  useEffect(() => {
    if (isHovered) return; // Pause if hovering

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sides.length);
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [sides.length, itemWidth, isHovered]);

  const loopingSides = [...sides, ...sides]; // duplicate for looping

  const renderCartItems = () => (
    <>
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-4" // Removed 'hidden lg:block'
        >
          <h3 className="text-sm lg:text-lg font-semibold mb-3">
            Add Side Orders
          </h3>

          <div
            className="relative overflow-hidden w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Left Arrow - Mobile optimized */}
            <button
              onClick={() =>
                setIndex((prev) =>
                  prev === 0 ? sides.length - 1 : prev - 1
                )
              }
              className="absolute left-1 lg:left-0 top-1/2 transform -translate-y-1/2 
              bg-white bg-opacity-80 hover:bg-opacity-100 
              p-2 lg:p-1 rounded-full z-20 shadow-lg
              min-w-[32px] min-h-[32px] lg:min-w-auto lg:min-h-auto
              flex items-center justify-center
              touch-manipulation"
              aria-label="Previous items"
            >
              <ArrowLeft size={16} className="lg:w-5 lg:h-5" />
            </button>

            <div className="relative overflow-hidden w-full">
              {/* Carousel */}
              <div className="flex gap-2 lg:gap-4 px-10 lg:px-8 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${index * (window.innerWidth < 1024 ? 88 : 120)}px)` }}>
                {sides.concat(sides).map((item, i) => {
                  const itemImage = getMenuItemImage(item.title, item.image);

                  return (
                    <div
                      key={`side-${i}`}
                      className="relative flex-shrink-0 w-16 lg:w-24"
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-full overflow-hidden group">
                          <img
                            src={itemImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleAddSideOrder(item)}
                            className="absolute inset-0 bg-black bg-opacity-40 
                          flex items-center justify-center 
                          opacity-0 group-hover:opacity-100 
                          group-active:opacity-100 transition-opacity rounded-full
                          touch-manipulation"
                            aria-label={`Add ${item.title}`}
                          >
                            <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </button>
                        </div>
                        <p
                          className="text-xs lg:text-sm mt-1 text-center w-16 lg:w-24 leading-tight truncate"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs font-semibold">
                          £{item.price.default}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Arrow - Mobile optimized */}
            <button
              onClick={() =>
                setIndex((prev) => (prev + 1) % sides.length)
              }
              className="absolute right-1 lg:right-0 top-1/2 transform -translate-y-1/2 
              bg-white bg-opacity-80 hover:bg-opacity-100 
              p-2 lg:p-1 rounded-full z-20 shadow-lg
              min-w-[32px] min-h-[32px] lg:min-w-auto lg:min-h-auto
              flex items-center justify-center
              touch-manipulation"
              aria-label="Next items"
            >
              <ArrowLeft
                size={16}
                className="lg:w-5 lg:h-5"
                style={{ transform: "rotate(180deg)" }}
              />
            </button>
          </div>
        </motion.div>
      )}
      {cart.map((item, index) => {
        const itemImage = getMenuItemImage(item.title, item.image);

        return (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="flex justify-start items-center border-b py-2 lg:py-4"
          >
            <div className="grid grid-cols-7">
              <div className="col-span-1 flex items-center">
                <img
                  src={itemImage}
                  alt={item.title}
                  className="w-auto h-30 object-cover mr-4 rounded"
                />
              </div>
              <div className="col-span-5 flex justify-start items-center">
                <div className="grid grid-cols-1 px-4">
                  <h1
                    className="font-semibold text-xs lg:text-lg text-start"
                    style={{ fontFamily: "Bambino", fontWeight: 450 }}
                  >
                    {item.title}
                  </h1>
                  <div className="flex items-center space-x-2 my-1">
                    <button
                      onClick={() =>
                        handleDecreaseQuantity(item.title, item.itemQuantity)
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <span className="text-gray-600 text-sm">
                      {item.itemQuantity}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.title)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.title)}
                      className="p-1 rounded-full hover:bg-gray-100 ml-2"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                  <p className="text-gray-600 text-start text-xxxs lg:text-sm">
                    {item.description.split("\n").map((line, index) => (
                      <span
                        key={index}
                        className={
                          line.startsWith("Review Note:")
                            ? "bg-yellow-200 px-1 py-0.5 inline-block rounded"
                            : ""
                        }
                      >
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="col-span-1 flex items-center">
                <p className="text-xs lg:text-base font-bold">
                  £{(Number(item.totalPrice) * item.itemQuantity).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-between items-center"
      >
        <h3 className="text-xl font-bold">Total order</h3>
        <div className="text-right">
          <p className={discountAmount > 0 ? "text-lg line-through text-gray-500" : "text-xl font-bold"}>
            £{totalPrice.toFixed(2)}
          </p>
          {discountAmount > 0 && (
            <p className="text-xl font-bold text-green-600">
              £{discountedTotal.toFixed(2)}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );

  const renderCustomerInfoForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div>
        {/* <label className="block mb-1 text-xs lg:text-sm">Delivery Option</label> */}
        <div className="flex space-x-4 text-xs lg:text-lg font-bold">
          <label className="font-bold">
            <input
              type="radio"
              name="deliveryOption"
              value="delivery"
              checked={formData.deliveryOption === "delivery"}
              onChange={handleChange}
            />{" "}
            Delivery
          </label>
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="pickup"
              checked={formData.deliveryOption === "pickup"}
              onChange={handleChange}
            />{" "}
            Pick Up
          </label>
        </div>
      </div>

      <div>
        <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>
      <div>
        <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>
      <div>
        <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>

      {/* Delivery / Pick Up Radio Buttons */}

      {formData.deliveryOption === "delivery" && (
        <div>
          <div>
            <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
              Street Address
            </label>
            <div className="relative">
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={(e) => {
                  handleChange(e);
                  setFilteredStreets(
                    streets.filter(street =>
                      street.toLowerCase().includes(e.target.value.toLowerCase())
                    )
                  );
                  setIsStreetDropdownOpen(true);
                }}
                onFocus={() => setIsStreetDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsStreetDropdownOpen(false), 200)}
                required
                disabled={!formData.address.zipCode}
                className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm disabled:bg-gray-100"
                placeholder={formData.address.zipCode ? "Select or type street address..." : "Please select a postcode first"}
              />
              {isStreetDropdownOpen && filteredStreets.length > 0 && formData.address.zipCode && (
                <ul className="absolute w-full border rounded mt-1 bg-white max-h-40 overflow-y-auto shadow-md z-10">
                  {filteredStreets.map((street) => (
                    <li
                      key={street}
                      className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onMouseDown={() => {
                        handleChange({
                          target: { name: "address.street", value: street },
                        });
                        setIsStreetDropdownOpen(false);
                      }}
                    >
                      {street}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
                className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
              />
            </div>

            <div className="relative">
              <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
                Post Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={(e) => {
                  handleChange(e);
                  setSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Delay to allow clicking options
                required
                className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
                placeholder="Search postal code..."
              />
              {isDropdownOpen && filteredPostalCodes.length > 0 && (
                <ul className="absolute w-full border rounded mt-1 bg-white max-h-40 overflow-y-auto shadow-md z-10">
                  {filteredPostalCodes.map((code) => (
                    <li
                      key={code}
                      className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onMouseDown={() => {
                        handleChange({
                          target: { name: "address.zipCode", value: code },
                        });
                        setSearch("");
                        setIsDropdownOpen(false);
                      }}
                    >
                      {code}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs lg:text-sm">
              Payment Option
            </label>
            <div className="flex space-x-4 text-xs lg:text-sm">
              {formData.deliveryOption === "delivery" && (<label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="Cash on Delivery"
                  checked={formData.paymentOption === "Cash on Delivery"}
                  onChange={handleChange}
                />{" "}
                Cash on Delivery
              </label>)}
              {formData.deliveryOption === "pickup" && (<label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="Cash on PickUp"
                  checked={formData.paymentOption === "Cash on PickUp"}
                  onChange={handleChange}
                />{" "}
                Cash on PickUp
              </label>)}

              <label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="Card"
                  checked={formData.paymentOption === "Card"}
                  onChange={handleChange}
                />{" "}
                Card Payment
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Review Notes */}
      <div>
        <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
          Review Notes
        </label>
        <textarea
          name="reviewNotes"
          value={formData.reviewNotes}
          onChange={handleChange}
          className="w-full p-2 border rounded text-sm lg:text-sm"
          rows="3"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 border-t"
      >
        <h3 className="text-sm lg:text-lg font-semibold mb-2">Order Summary</h3>
        <div className="flex justify-between text-sm lg:text-base mb-1">
          <span>Subtotal</span>
          <span className={discountAmount > 0 ? "line-through text-gray-500" : ""}>
            £{totalPrice.toFixed(2)}
          </span>
        </div>
        {activeOffer && discountAmount > 0 && (
          <div className="flex justify-between text-sm lg:text-base mb-1 text-red-600">
            <span>{activeOffer.offer_text}</span>
            <span>-£{discountAmount.toFixed(2)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm lg:text-base mb-1 text-green-600">
            <span>Discounted Subtotal</span>
            <span>£{discountedTotal.toFixed(2)}</span>
          </div>
        )}



        {formData.deliveryOption === "delivery" && (
          <div className="flex justify-between text-sm lg:text-base mb-1">
            <span>Delivery Fee</span>
            <span className={finalDeliveryFee === 0 && deliveryFee > 0 ? "line-through text-gray-500" : ""}>
              £{deliveryFee.toFixed(2)}
            </span>
          </div>
        )}

        {finalDeliveryFee === 0 && deliveryFee > 0 && (
          <div className="flex justify-between text-sm lg:text-base mb-1 text-green-600">
            <span>Delivery Fee (Free)</span>
            <span>£0.00</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm lg:text-base">
          <span>Total</span>
          <span>£{finalTotal.toFixed(2)}</span>
        </div>
        {formError && (
          <div className="text-red-600 text-sm lg:text-base font-medium">
            {formError}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderPaymentForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="mb-1 lg:mb-4">
        <CardElement className="p-0 lg:p-2 border roundedtext-sm lg:text-base " />
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center p-6"
    >
      <h2 className="text-2xl font-bold mb-4">Thank You for Your Order!</h2>
      <p>Your order has been successfully processed.</p>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && shouldRenderCart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0  z-50 flex justify-end lg:mt-16 rounded-lg shadow-xl"
          style={{ pointerEvents: "none" }}
        >
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="bg-white w-4/5 lg:w-[25%] h-full p-6 overflow-y-auto rounded-lg shadow-xl"
            style={{ pointerEvents: "auto", backgroundColor: "#F6F5F5" }}
          >
            <div
              className="-mx-6 -mt-6 mb-6 p-4 flex items-center block lg:hidden"
              style={{ backgroundColor: colors.primaryRed }}
            >
              {checkoutStage !== "cart" && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (checkoutStage === "customer-info")
                      setCheckoutStage("cart");
                    if (checkoutStage === "payment")
                      setCheckoutStage("customer-info");
                    if (checkoutStage === "confirmation")
                      setCheckoutStage("payment");
                  }}
                  className="text-white hover:text-gray-200 mr-4"
                >
                  <ArrowLeft size={24} />
                </motion.button>
              )}
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base lg:text-2xl font-bold text-white flex-grow text-start lg:text-center"
                style={{ fontFamily: "Bambino", fontWeight: 450 }}
              >
                {checkoutStage === "cart" && "SHOPPING CART"}
                {checkoutStage === "customer-info" && "CUSTOMER INFORMATION"}
                {checkoutStage === "payment" && "PAYMENT DETAILS"}
                {checkoutStage === "confirmation" && "ORDER CONFIRMATION"}
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </motion.button>
            </div>

            {checkoutStage !== "cart" && (
              <div className="hidden lg:flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (checkoutStage === "customer-info")
                      setCheckoutStage("cart");
                    if (checkoutStage === "payment")
                      setCheckoutStage("customer-info");
                    if (checkoutStage === "confirmation")
                      setCheckoutStage("payment");
                  }}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="mr-2" size={18} />
                  Back
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {checkoutStage === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-500"
                    >
                      <div className=" flex justify-center items-center">
                        <img
                          className="h-8
                         w-auto opacity-10 pr-3"
                          src={basket}
                          alt="Basket"
                        />
                        <span>Your cart is empty</span>
                      </div>
                      <div className="flex items-center justify-center mt-20 opacity-10">
                        <img
                          className="h-92
                         w-auto"
                          src={logo}
                          alt="Logo"
                        />
                      </div>
                    </motion.p>
                  ) : (
                    <>
                      {renderCartItems()}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setCheckoutStage("customer-info")}
                        className="w-full  text-white text-sm lg:text-base py-1 lg:py-3 mt-6 rounded-lg transition"
                        style={{ backgroundColor: colors.primaryRed }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#8a1613")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          colors.primaryRed)
                        }
                      >
                        Proceed to Checkout
                      </motion.button>
                    </>
                  )}
                </>
              )}

              {checkoutStage === "customer-info" && renderCustomerInfoForm()}
              {checkoutStage === "payment" && renderPaymentForm()}
              {checkoutStage === "confirmation" && renderConfirmation()}

              {checkoutStage !== "cart" && checkoutStage !== "confirmation" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={(processing && checkoutStage === "payment") || isSubmittingRef.current}
                  className="w-full  text-white text-sm lg:text-base py-1 lg:py-3 mt-6 rounded-lg  transition"
                  style={{ backgroundColor: colors.primaryRed }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#8a1613")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.primaryRed)
                  }
                >
                  {checkoutStage === "customer-info" && "Continue to Payment"}
                  {checkoutStage === "payment" &&
                    (processing
                      ? "Processing..."
                      : `Pay £${finalTotal.toFixed(2)}`)}
                </motion.button>
              )}

              {checkoutStage === "confirmation" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleSubmit}
                  className="w-full  text-white py-3 mt-6 rounded-lg  transition"
                  style={{ backgroundColor: colors.primaryRed }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#8a1613")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = colors.primaryRed)
                  }
                >
                  Close
                </motion.button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
