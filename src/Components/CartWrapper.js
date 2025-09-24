// Components/CartWrapper.js
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Cart from "./Cart";

const stripePromise = loadStripe(
  "pk_live_51Qjkvz09BvMasiZC6q7i71AEX7sOjjuqxxY0GKvbMDlPAxRLOBto1ZUNCAMQwA17F8hvvO9VID1VkIvOeGtAfyd200WaTthWzi"
);


const CartWrapper = ({ isOpen, onClose }) => (
  
  <Elements stripe={stripePromise}>
    <Cart isOpen={isOpen} onClose={onClose} />
  </Elements>
);

export default CartWrapper;
