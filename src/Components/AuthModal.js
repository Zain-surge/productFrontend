import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AuthModal = ({ onClose, onLogin, onSignUp, onGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+44");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    street_address: "",
    city: "",
    county: "",
    postal_code: "",
  });

  const countryCodes = [{ code: "+44", country: "UK" }];
  const [passwordValidations, setPasswordValidations] = useState({
    hasCapital: false,
    hasNumber: false,
    isLongEnough: false,
    passwordsMatch: true, // Initially assume passwords match
  });
  const [showPasswordMatchError, setShowPasswordMatchError] = useState(false);
  const [errors, setErrors] = useState({});

  const HeadingTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 650,
  };
  const NameTextStyle = {
    fontFamily: "Bambino",
    fontWeight: 450,
  };

  useEffect(() => {
    // Delay password validation updates
    const timeout = setTimeout(() => {
      const hasCapital = /[A-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const isLongEnough = formData.password.length > 8;
      const passwordsMatch = formData.password === formData.confirmPassword;

      setPasswordValidations({
        hasCapital,
        hasNumber,
        isLongEnough,
        passwordsMatch,
      });
    }, 100); // 100ms delay

    return () => clearTimeout(timeout);
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "confirmPassword") {
      setShowPasswordMatchError(true); // Show mismatch error only after typing in confirmPassword
    }
  };
  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const number = value.replace(/\D/g, "");

    // Format based on length
    if (number.length <= 4) {
      return number;
    } else if (number.length <= 7) {
      return `${number.slice(0, 4)} ${number.slice(4)}`;
    } else {
      return `${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(
        7,
        11
      )}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone_number: formattedNumber });
  };

  const onPageChange = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      street_address: "",
      city: "",
      county: "",
      postal_code: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!isLogin) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Confirm Password is required";
      if (!formData.phone_number)
        newErrors.phone_number = "Phone Number is required";
      if (!formData.street_address)
        newErrors.street_address = "Street Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.county) newErrors.county = "County is required";
      if (!formData.postal_code)
        newErrors.postal_code = "Postal Code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (isLogin) {
        onLogin(formData);
      } else {
        if (passwordValidations.passwordsMatch) {
          onSignUp(formData);
        } else {
          alert("Passwords do not match");
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        style={{ zIndex: "200" }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`bg-white p-4 lg:pl-8 lg:pr-8 lg:pt-4 lg:pb-4 rounded-lg ${
            isLogin
              ? "w-full max-w-xs lg:max-w-lg"
              : "w-full max-w-xs lg:max-w-2xl"
          }`}
        >
          <h2
            className="text-base lg:text-xl font-bold mb-6 flex justify-center"
            style={HeadingTextStyle}
          >
            {isLogin ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              className={`grid ${
                isLogin ? "grid-cols-1" : "grid-cols-2"
              } gap-4 mb-1 lg:mb-2`}
            >
              {!isLogin && (
                <div>
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Enter your full name"
                    maxLength="32"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
              )}
              <div>
                <label
                  className="block text-xs lg:text-sm font-medium mb-2"
                  style={NameTextStyle}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                  placeholder="Enter your email"
                  pattern="[^@]+@[^@]+\.[a-zA-Z]{2,}"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs lg:text-sm">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div
              className={`grid ${
                isLogin ? "grid-cols-1" : "grid-cols-2"
              } gap-4 mb-1 lg:mb-2`}
            >
              <div>
                <label
                  className="block text-xs lg:text-sm font-medium mb-2"
                  style={NameTextStyle}
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                  placeholder="Enter your password"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
                {!isLogin && (
                  <div className="text-xxs lg:text-sm mt-2">
                    <p
                      style={{
                        color: passwordValidations.hasCapital ? "green" : "red",
                      }}
                    >
                      • At least one capital letter
                    </p>
                    <p
                      style={{
                        color: passwordValidations.hasNumber ? "green" : "red",
                      }}
                    >
                      • At least one number
                    </p>
                    <p
                      style={{
                        color: passwordValidations.isLongEnough
                          ? "green"
                          : "red",
                      }}
                    >
                      • Longer than 8 characters
                    </p>
                  </div>
                )}
              </div>
              {!isLogin && (
                <div>
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                  {showPasswordMatchError &&
                    !passwordValidations.passwordsMatch && (
                      <p style={{ color: "red" }}>• Passwords do not match</p>
                    )}
                </div>
              )}
            </div>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-1 lg:mb-2">
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    Phone Number
                  </label>
                  <div className="flex">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="p-1 lg:p-2 border border-gray-300 text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm rounded-l w-10 lg:w-24 bg-gray-50"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handlePhoneChange}
                      className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                      placeholder="7XXX XXXX XX"
                      maxLength="13"
                      required
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone_number}
                    </p>
                  )}
                  <p className="text-gray-500 text-xxs mt-1">
                    Format: {selectedCountryCode} 7XXX XXX XXX
                  </p>
                </div>
                <div className="mb-1 lg:mb-2">
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Enter your street address"
                    required
                  />
                  {errors.street_address && (
                    <p className="text-red-500 text-sm">
                      {errors.street_address}
                    </p>
                  )}
                </div>
                <div className="mb-1 lg:mb-2">
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Enter your city"
                    required
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>
                <div className="mb-1 lg:mb-2">
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    County
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Enter your county"
                    required
                  />
                  {errors.county && (
                    <p className="text-red-500 text-sm">{errors.county}</p>
                  )}
                </div>
                <div className="mb-1 lg:mb-2">
                  <label
                    className="block text-xs lg:text-sm font-medium mb-2"
                    style={NameTextStyle}
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full p-1 lg:p-2 border border-gray-300 rounded text-xs lg:text-sm placeholder:text-xs lg:placeholder:text-sm"
                    placeholder="Enter your postal code"
                    pattern="\d{1,7}"
                    required
                  />
                  {errors.postal_code && (
                    <p className="text-red-500 text-sm">{errors.postal_code}</p>
                  )}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-1 lg:p-2 rounded hover:bg-blue-600 text-sm lg:text-base"
              style={{ backgroundColor: "#074711" }}
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          <button
            onClick={onPageChange}
            className="mt-4 text-blue-500 w-[100%] hover:underline flex justify-center items-center text-xs lg:text-base"
          >
            {isLogin
              ? "Don't have an account? Create an account.."
              : "Already have an account? Login"}
          </button>
          <button
            onClick={onGuest}
            className="mt-4 w-full bg-gray-500 text-white p-1 lg:p-2 rounded hover:bg-gray-600 text-sm lg:text-base"
            style={{ backgroundColor: "#AA1B17" }}
          >
            Continue as Guest
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
