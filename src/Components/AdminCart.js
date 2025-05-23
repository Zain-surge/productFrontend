import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  updateItemQuantity,
  removeFromCart,
  clearCart,
} from "../store/cartSlice";
import { addOrder, setTodayOrders } from "../store/ordersSlice";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import Pizza from "../images/CLIPARTS/PizzasS.png";
import Shawarma from "../images/CLIPARTS/ShawarmaS.png";
import Burgers from "../images/CLIPARTS/BurgersS.png";
import Calzones from "../images/CLIPARTS/CalzonesS.png";
import GarlicBread from "../images/CLIPARTS/GarlicBreadS.png";
import Wraps from "../images/CLIPARTS/WrapsS.png";
import KidsMeal from "../images/CLIPARTS/KidsMealS.png";
import Sides from "../images/CLIPARTS/SidesS.png";
import Drinks from "../images/CLIPARTS/DrinksS.png";

import TakeAway from "../images/TakeAway.png";
import men from "../images/men.png";
import Delivery from "../images/Delivery.png";
import DineIn from "../images/DineIn.png";
import TakeAwayWhite from "../images/TakeAwaywhite.png";
import DeliveryWhite from "../images/Deliverywhite.png";
import DineInWhite from "../images/DineInwhite.png";
import orderSound from "../assets/order-success.mp3";

const AdminCart = ({ isOpen, onClose, menuItems }) => {
  const [selectedType, setSelectedType] = useState("takeaway");

  const handleClick = (type) => {
    setSelectedType(type);
    console.log("Selected Type:", type); // optional for debugging
  };
  debugger;
  const location = useLocation();
  const shouldRenderCart = location.pathname === "/admin/menuT";

  const user = useSelector((state) => state.user?.user?.userDetails);
  const [formData, setFormData] = useState({
    name: user ? user.name : "",
    email: user ? user.email : "",
    phone: user ? user.phone_number : "",
    address: {
      street: user ? user.street_address : "POS ORDER",
      city: user ? user.city : "POS ORDER",
      state: user ? user.county : "POS ORDER",
      zipCode: user ? user.postal_code : "POS ORDER",
    },
    deliveryOption: "POS ORDER",
    paymentOption: "POS ORDER",
    reviewNotes: "",
  });
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const DescriptionStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    alignContent: "center",
  };
  const NumberStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 700,
    alignContent: "center",
  };

  const totalPrice = cart.reduce(
    (total, item) => total + parseFloat(item.totalPrice * item.itemQuantity),
    0
  );

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

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const orderAudioRef = useRef(null);

  // Preload audio once when component mounts
  useEffect(() => {
    orderAudioRef.current = new Audio(orderSound);
    orderAudioRef.current.preload = "auto";
  }, []);

  // Play the sound when order is successful
  const playOrderSound = () => {
    if (orderAudioRef.current) {
      orderAudioRef.current.currentTime = 0; // rewind to start
      orderAudioRef.current.play();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      // Step 3: Check if User Exists in Database
      let userId = null;
      let guestId = null;

      try {
        if (user) {
          userId = user.user_id;
        } else {
          // Create a guest entry if the user doesn't exist
          const guestResponse = await axios.post(
            "https://thevillage-backend.onrender.com/users/create-guest",
            {
              name: formData.name,
              email: formData.email,
              phone_number: formData.phone,
              street_address: formData.address.street,
              city: formData.address.city,
              county: formData.address.state,
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
      let transactionId;
      try {
        transactionId = Math.floor(
          100000000000 + Math.random() * 900000000000
        ).toString();

        const orderResponse = await axios.post(
          "https://thevillage-backend.onrender.com/orders/create",
          {
            user_id: userId,
            guest_id: guestId,
            transaction_id: transactionId,
            payment_type: formData.paymentOption,
            order_type: selectedType,
            total_price: totalPrice,
            extra_notes: formData.reviewNotes || "",
            status: "yellow",
            order_source: "EPOS",
          }
        );

        if (orderResponse.data && orderResponse.data.order_id) {
          orderId = orderResponse.data.order_id;
        } else {
          throw new Error("Failed to create order.");
        }
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        setError("Order creation failed. Please try again.");
        return;
      }

      // Step 5: Insert Order Items into Database
      try {
        await Promise.all(
          cart.map(async (item) => {
            await axios.post(
              "https://thevillage-backend.onrender.com/orders/add-item",
              {
                order_id: orderId,
                item_id: item.id,
                quantity: item.itemQuantity,
                description: item.description,
                total_price: item.totalPrice,
              }
            );
          })
        );
        debugger;
        const formattedCart = cart.map((item) => ({
          item_name: item.title,
          item_type: item.item_type,
          quantity: item.itemQuantity,
          item_description: item.description,
          item_total_price: item.totalPrice, // already a string
          item_id: item.id.toString(), // ensure it's a string
        }));

        dispatch(
          addOrder({
            order_id: orderId,
            payment_type: formData.paymentOption,
            transaction_id: transactionId,
            order_type: selectedType,
            order_source: "EPOS",
            change: 0,
            status: "yellow",
            customer_name: "POS SYSTEM",
            phone_number: "POS SYSTEM",
            street_address: "Table 12",
            city: "Islamabad",
            county: "Blue Area",
            postal_code: "44000",
            order_total_price: totalPrice,
            created_at: new Date().toISOString(),

            items: formattedCart,
          })
        );
        // Clear cart after successful order
        dispatch(clearCart());
        playOrderSound();
        onClose();
        // You could add a success message here
      } catch (orderItemError) {
        console.error("Order item insertion error:", orderItemError);
        setError("Some items could not be recorded. Please try again.");
      }
    } catch (err) {
      console.error("Order Error:", err);
      setError(err.message || "Order failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
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

  const renderCartItems = () => (
    <>
      <div className="border-b border-gray-600 pb-6 max-h-[68%] overflow-y-auto custom-scrollbar">
        {cart.map((item) => (
          <div className="grid grid-cols-7 py-2" key={item.id}>
            <div className="col-span-1 text-4xl" style={NumberStyle}>
              {item.itemQuantity}
            </div>
            <div
              className="col-span-4 border-r border-gray-600 "
              style={DescriptionStyle}
            >
              {item.description}
            </div>
            <div className="grid col-span-2 px-2 justify-center">
              <div className="flex justify-center">
                <img
                  className="h-16 lg:h-24 w-auto"
                  src={images[item.item_type]}
                  alt={item.item_type}
                />
              </div>
              <div
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  textAlign: "center",
                }}
              >
                {" "}
                {item.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-between items-center"
      >
        <h3 className="text-xl font-bold">Sub-total</h3>
        <p className="text-xl font-bold">£{totalPrice.toFixed(2)}</p>
      </motion.div>
    </>
  );

  return (
    <>
      {isOpen && shouldRenderCart && (
        <>
          <div className="grid grid-cols-3">
            <div
              className="col-span-1 flex justify-center items-center mx-7"
              style={{
                backgroundColor:
                  selectedType === "takeaway" ? "#000000" : "#ffffff",
                borderRadius: "8px",
              }}
            >
              <img
                className="h-10 w-auto my-1 px-2"
                src={selectedType === "takeaway" ? TakeAwayWhite : TakeAway}
                alt="Take Away"
                onClick={() => handleClick("takeaway")}
              />
            </div>

            <div
              className="col-span-1 flex justify-center items-center mx-7"
              style={{
                backgroundColor:
                  selectedType === "dinein" ? "#000000" : "#ffffff",
                borderRadius: "8px",
              }}
            >
              <img
                className="h-12 w-auto my-1 px-2"
                src={selectedType === "dinein" ? DineInWhite : DineIn}
                alt="Dine In"
                onClick={() => handleClick("dinein")}
              />
            </div>

            <div
              className="col-span-1 flex justify-center items-center mx-7"
              style={{
                backgroundColor:
                  selectedType === "delivery" ? "#000000" : "#ffffff",
                borderRadius: "8px",
              }}
            >
              <img
                className="h-10 w-auto my-1 px-2"
                src={selectedType === "delivery" ? DeliveryWhite : Delivery}
                alt="Delivery"
                onClick={() => handleClick("delivery")}
              />
            </div>
          </div>
          <div className="w-[90%] h-[2px] bg-gray-300 mx-auto mt-2" />

          {cart.length === 0 ? (
            <p className="text-center text-gray-500">ITEMS TO BE SHOWN HERE</p>
          ) : (
            <>
              {renderCartItems()}
              {/* {renderCustomerInfoForm()} */}
              <div className="gird grid-cols-4" style={{ display: "grid" }}>
                <div className="col-span-3 justify-center items-center">
                  <form onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 mt-4">{error}</div>}
                    <button
                      type="submit"
                      disabled={processing}
                      className=" bg-[#000000] text-white text-sm md:text-lg py-1 md:py-3 mt-6 rounded-lg  transition w-full"
                    >
                      {processing
                        ? "Processing..."
                        : `Charge £ ${totalPrice.toFixed(2)}`}
                    </button>
                  </form>
                </div>
                <div className="col-span-1 flex justify-center items-center ">
                  <img className="h-10 w-auto " src={men} alt="Delivery" />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default AdminCart;
