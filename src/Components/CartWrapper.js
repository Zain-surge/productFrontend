// Components/CartWrapper.js
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Cart from "./Cart";

const stripePromise = loadStripe(
  "pk_test_51Qjkvz09BvMasiZC1YmgMdc7JBgVwxMbD1wG1Mu1i4ec3j51DaVw9ypm4HNCM6ox08X51MHCypKJcENwIALs0qzl00oeH8G11i"
);

const CartWrapper = ({ isOpen, onClose }) => (
  <Elements stripe={stripePromise}>
    <Cart isOpen={isOpen} onClose={onClose} />
  </Elements>
);

export default CartWrapper;
