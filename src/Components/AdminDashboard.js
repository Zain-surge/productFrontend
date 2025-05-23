import AdminMenu from "./AdminMenu";
import { useState } from "react";
import { motion } from "framer-motion";

function AdminDashboard({ menuItems, orderType }) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("standard");
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [salesView, setSalesView] = useState("daily");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingState, setPendingState] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryOption: orderType,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    tableNumber: "",
    paymentOption: "cod",
    reviewNotes: "",
  });

  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredPostalCodes = ["NW1 5DB", "E1 6AN", "SE1 9GF"].filter((code) =>
    code.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleClick = () => {
    setPendingState(!isOpen);
    setShowConfirmation(true);
  };

  const cancelToggle = () => {
    setShowConfirmation(false);
    setPendingState(null);
  };

  const confirmToggle = () => {
    setIsOpen(pendingState);
    setShowConfirmation(false);
    setPendingState(null);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleSubmit = () => {
    const newErrors = {};

    if (formData.deliveryOption === "Delivery") {
      if (!formData.address.street)
        newErrors.street = "Street address is required.";
      if (!formData.address.city) newErrors.city = "City is required.";
      if (!formData.address.state) newErrors.state = "County is required.";
      if (!formData.address.zipCode)
        newErrors.zipCode = "Post code is required.";
    } else if (formData.deliveryOption === "DineIn") {
      if (!formData.tableNumber)
        newErrors.tableNumber = "Table number is required.";
    } else if (formData.deliveryOption === "TakeAway") {
      if (!formData.phone) newErrors.phone = "Phone number is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted:", formData);
      setIsModalOpen(false); // Optionally close modal
    }
  };

  const renderCustomerInfoForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div>
        <label
          className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
        >
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>
      <div>
        <label
          className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>
      <div>
        <label
          className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
        >
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
        />
      </div>

      {/* Delivery / Pick Up Radio Buttons */}
      <div>
        <label
          className="block mb-1 text-xs lg:text-sm"
          style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
        >
          Delivery Option
        </label>
        <div className="flex space-x-4 text-xs lg:text-sm">
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="Delivery"
              checked={formData.deliveryOption === "Delivery"}
              onChange={handleChange}
            />{" "}
            Delivery
          </label>
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="TakeAway"
              checked={formData.deliveryOption === "TakeAway"}
              onChange={handleChange}
            />{" "}
            TakeAway
          </label>
          <label>
            <input
              type="radio"
              name="deliveryOption"
              value="DineIn"
              checked={formData.deliveryOption === "DineIn"}
              onChange={handleChange}
            />{" "}
            Dine In
          </label>
        </div>
      </div>
      {formData.deliveryOption === "DineIn" && (
        <div>
          <label
            className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
          >
            Table Number
          </label>
          <input
            type="text"
            name="tableNumber"
            value={formData.tableNumber}
            onChange={handleChange}
            className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
          />
          {errors.tableNumber && (
            <p className="text-red-600 text-xs mt-1">{errors.tableNumber}</p>
          )}
        </div>
      )}
      {formData.deliveryOption === "Delivery" && (
        <div>
          <label
            className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
          >
            Street Address
          </label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
          />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
              >
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
              />
            </div>
            <div>
              <label
                className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
              >
                County
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full p-0 lg:p-2 border rounded text-sm lg:text-sm"
              />
            </div>
            <div className="relative">
              <label
                className="block mb-1 lg:mb-2 text-xs lg:text-sm text-start"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 450 }}
              >
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
        </div>
      )}

      <div className="text-right pt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded hover:bg-black transition duration-200 text-sm lg:text-base"
        >
          Submit
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <div>
        <AdminMenu menuItems={menuItems} />
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center "
          style={{ zIndex: "200" }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[70vh] overflow-y-auto relative">
            <h2
              className="text-lg font-semibold mb-4 "
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 650 }}
            >
              CUSTOMER INFORMATION
            </h2>
            {renderCustomerInfoForm()}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
