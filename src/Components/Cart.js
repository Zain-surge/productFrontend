import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { addToCart } from "../store/cartSlice";
import {
  updateItemQuantity,
  removeFromCart,
  clearCart,
} from "../store/cartSlice";
import {
  Elements,
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

const Cart = ({ isOpen, onClose, menuItems }) => {
  const location = useLocation();
  const shouldRenderCart = location.pathname === "/";
  const [checkoutStage, setCheckoutStage] = useState("cart");

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
    paymentOption: "online",
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

  useEffect(() => {
    const fetchNearbyPlaces = async (lat, lon, radius = 5000) => {
      const overpassQuery = `
        [out:json];
        (
          node(around:${radius}, ${lat}, ${lon})["addr:postcode"];
          way(around:${radius}, ${lat}, ${lon})["addr:postcode"];
          relation(around:${radius}, ${lat}, ${lon})["addr:postcode"];
        );
        out center;`;

      const url = "https://overpass-api.de/api/interpreter";

      try {
        const response = await axios.post(
          url,
          `data=${encodeURIComponent(overpassQuery)}`
        );
        console.log("PLACES DATS: ", response.data);
        // Group results by postal code
        const groupedPlaces = response.data.elements.reduce((acc, place) => {
          const postalCode = place.tags?.["addr:postcode"] || "Unknown";
          const placeData = {
            id: place.id,
            name: place.tags?.["name"] || "Unknown",
            lat: place.lat || place.center?.lat,
            lon: place.lon || place.center?.lon,
          };

          if (!acc[postalCode]) {
            acc[postalCode] = [];
          }
          acc[postalCode].push(placeData);

          return acc;
        }, {});

        setPlaces(groupedPlaces);

        const codes = Object.keys(groupedPlaces).filter(
          (code) => code !== "Unknown"
        );
        setPostalCodes(codes);
        setFilteredPostalCodes(codes);
      } catch (error) {
        console.error("Error fetching places:", error.message);
      }
    };

    fetchNearbyPlaces(53.752574, -2.3620782, 5000);
  }, []);

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
  const finalTotal = totalPrice + deliveryFee;
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
        paymentOption: "cod", // Force to COD when pickup
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
    if (
      checkoutStage === "customer-info" &&
      formData.deliveryOption === "delivery" &&
      totalPrice < 8.5
    ) {
      setFormError("Cannot place a delivery order less than £8.50.");
      return;
    }
    const normalizedInput = formData.address.zipCode
      .replace(/\s/g, "")
      .toLowerCase();
    const normalizedPostalCodes = postalCodes.map((code) =>
      code.replace(/\s/g, "").toLowerCase()
    );

    if (
      checkoutStage === "customer-info" &&
      formData.deliveryOption === "delivery" &&
      !normalizedPostalCodes.includes(normalizedInput)
    ) {
      setFormError("Invalid postal code. Please select from the dropdown.");
      return;
    }

    setFormError("");

    if (
      checkoutStage === "customer-info" &&
      formData.paymentOption == "online"
    ) {
      setCheckoutStage("payment");
      return;
    } else if (
      checkoutStage === "customer-info" &&
      formData.paymentOption != "online"
    ) {
      // Step 3: Check if User Exists in Database
      let userId = null;
      let guestId = null;

      try {
        if (user) {
          userId = user.user_id;
        } else {
          // Create a guest entry if the user doesn't exist
          const guestResponse = await axiosInstance.post(
            "/users/create-guest",
            {
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone,
              street_address: formData.address.street,
              city: formData.address.city,
              county: "",
              postal_code: formData.address.zipCode,
            }
          );

          if (guestResponse.data && guestResponse.data.guest_id) {
            guestId = guestResponse.data.guest_id;
          }
        }
      } catch (userError) {
        console.error("Error checking user existence:", userError);
        setError("User verification failed. Please try again.");
        return;
      }

      // Step 4: Insert Order into Database
      let orderId;
      try {
        const transactionId = Math.floor(
          100000000000 + Math.random() * 900000000000
        ).toString();

        const orderResponse = await axiosInstance.post("/orders/create", {
          user_id: userId,
          guest_id: guestId,
          transaction_id: transactionId,
          payment_type: formData.paymentOption,
          order_type: formData.deliveryOption,
          total_price: totalPrice,
          extra_notes: formData.extraNotes || "",
          status: "yellow",
          order_source: "Website",
          driver_id: null,
        });

        if (orderResponse.data && orderResponse.data.order_id) {
          orderId = orderResponse.data.order_id;
        } else {
          throw new Error("Failed to create order.");
        }
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        setError("Payment was successful, but order creation failed.");
        return;
      }

      // Step 5: Insert Order Items into Database
      try {
        await Promise.all(
          cart.map(async (item) => {
            await axiosInstance.post("/orders/add-item", {
              order_id: orderId,
              item_id: item.id,
              quantity: item.itemQuantity,
              description: item.description,
              total_price: item.totalPrice,
            });
          })
        );
      } catch (orderItemError) {
        console.error("Order item insertion error:", orderItemError);
        setError(
          "Payment was successful, but some items could not be recorded."
        );
      }
      setCheckoutStage("confirmation");
    }

    if (checkoutStage == "confirmation") {
      console.log("CONFIRMATION STAGE");
      dispatch(clearCart());
      setCheckoutStage("cart");
    }

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create Payment Intent
      const { data } = await axiosInstance.post(
        "/payment/create-payment-intent",
        {
          amount: finalTotal,
          customerInfo: formData,
          cartItems: cart,
        }
      );

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

      // Step 3: Check if User Exists in Database
      let userId = null;
      let guestId = null;

      try {
        if (user) {
          userId = user.user_id;
        } else {
          // Create a guest entry if the user doesn't exist
          const guestResponse = await axiosInstance.post(
            "/users/create-guest",
            {
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone,
              street_address: formData.address.street,
              city: formData.address.city,
              county: "",
              postal_code: formData.address.zipCode,
            }
          );

          if (guestResponse.data && guestResponse.data.guest_id) {
            guestId = guestResponse.data.guest_id;
          }
        }
      } catch (userError) {
        console.error("Error checking user existence:", userError);
        setError("User verification failed. Please try again.");
        return;
      }

      // Step 4: Insert Order into Database
      let orderId;
      try {
        const orderResponse = await axiosInstance.post("/orders/create", {
          user_id: userId,
          guest_id: guestId,
          transaction_id: result.paymentIntent.id,
          payment_type: formData.paymentOption,
          order_type: formData.deliveryOption,
          total_price: totalPrice,
          extra_notes: formData.extraNotes || "",
        });

        if (orderResponse.data && orderResponse.data.order_id) {
          orderId = orderResponse.data.order_id;
        } else {
          throw new Error("Failed to create order.");
        }
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        setError("Payment was successful, but order creation failed.");
        return;
      }

      // Step 5: Insert Order Items into Database
      try {
        await Promise.all(
          cart.map(async (item) => {
            await axiosInstance.post("/orders/add-item", {
              order_id: orderId,
              item_id: item.id,
              quantity: item.itemQuantity,
              description: item.description,
              total_price: item.totalPrice,
            });
          })
        );
      } catch (orderItemError) {
        console.error("Order item insertion error:", orderItemError);
        setError(
          "Payment was successful, but some items could not be recorded."
        );
      }
      // Step 5: Payment Success, Proceed to Confirmation
      setCheckoutStage("confirmation");
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  const INTERVAL = 3000; // 2 seconds
  const sides = menuItems?.filter((item) => item.Type === "Sides") || [];
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
          className="mt-6 mb-4"
        >
          <h3 className="text-sm lg:text-lg font-semibold mb-3">
            Add Side Orders
          </h3>
          {/* Left Arrow */}
          <div
            className="relative overflow-hidden w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={() =>
                setIndex((prev) =>
                  prev === 0 ? loopingSides.length - 1 : prev - 1
                )
              }
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-full z-10 shadow"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative overflow-hidden w-full">
              {/* Carousel */}
              <motion.div
                className="flex gap-4 px-8" // px-8 to avoid arrow overlap
                animate={{ x: -index * itemWidth }}
                transition={{ ease: "easeInOut", duration: 0.5 }}
              >
                {loopingSides.map((item, i) => (
                  <div
                    key={`side-${i}`}
                    ref={i === 0 ? itemRef : null} // measure only first item
                    className="relative flex-shrink-0"
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative w-16 h-16 lg:w-24 lg:h-24 rounded-full overflow-hidden group">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleAddSideOrder(item)}
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                          <Plus size={24} className="text-white" />
                        </button>
                      </div>
                      <p
                        className="text-xs lg:text-sm mt-1 text-center max-w-[80px]"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs font-semibold">
                        £{item.price.default}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Right Arrow */}
            <button
              onClick={() =>
                setIndex((prev) => (prev + 1) % loopingSides.length)
              }
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 p-1 rounded-full z-10 shadow"
            >
              <ArrowLeft size={20} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </motion.div>
      )}
      {cart.map((item, index) => (
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
                src={`${item.image}`}
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
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-between items-center"
      >
        <h3 className="text-xl font-bold">Total order</h3>
        <p className="text-xl font-bold">£{totalPrice.toFixed(2)}</p>
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
          <label className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start">
            Street Address
          </label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            required
            className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
          />

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
              <label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="cod"
                  checked={formData.paymentOption === "cod"}
                  onChange={handleChange}
                />{" "}
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentOption"
                  value="online"
                  checked={formData.paymentOption === "online"}
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
          <span>£{totalPrice.toFixed(2)}</span>
        </div>
        {formData.deliveryOption === "delivery" && (
          <div className="flex justify-between text-sm lg:text-base mb-1">
            <span>Delivery Fee</span>
            <span>£1.50</span>
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
                  disabled={processing && checkoutStage === "payment"}
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
