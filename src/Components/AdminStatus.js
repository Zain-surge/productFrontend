import { React, useState } from "react";
import TakeAway from "../images/TakeAwaywhite.png";
import Delivery from "../images/Deliverywhite.png";
import DineIn from "../images/DineInwhite.png";
import Website from "../images/webwhite.png";
import printer from "../images/printer.png";
import Pizza from "../images/CLIPARTS/PizzasS.png";
import Shawarma from "../images/CLIPARTS/ShawarmaS.png";
import Burgers from "../images/CLIPARTS/BurgersS.png";
import Calzones from "../images/CLIPARTS/CalzonesS.png";
import GarlicBread from "../images/CLIPARTS/GarlicBreadS.png";
import Wraps from "../images/CLIPARTS/WrapsS.png";
import KidsMeal from "../images/CLIPARTS/KidsMealS.png";
import Sides from "../images/CLIPARTS/SidesS.png";
import Drinks from "../images/CLIPARTS/DrinksS.png";
import { useSelector, useDispatch } from "react-redux";
import { updateOrderStatus } from "../store/ordersSlice";

function AdminStatus({ statusType, orderSource }) {
  const TodayOrders = useSelector((state) => state.orders.todayOrders);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState(TodayOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [localStatus, setlocalStatus] = useState(statusType);
  const [valueStatus, setvalueStatus] = useState("Pending");
  let imageSrc, label;
  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ order_id: orderId, status: newStatus }));
  };
  const HeadingStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
    backgroundColor: "#000000",
    borderRadius: "20px",
  };
  const AddressStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    borderRadius: "40px",
  };
  const AddressCartStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
  };
  const TotalAmountStyle = {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 550,
    backgroundColor: "#000000",
    borderRadius: "20px",
  };
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

  // Map statusType to order_type
  const typeMapping = {
    TakeAway: "takeaway",
    Delivery: "delivery",
    DineIn: "dinein", // assuming possible future support
  };
  const typeMappingWeb = {
    pickup: "pickup",
    delivery: "delivery",
  };
  const sourceMapping = {
    EPOS: "EPOS",
    Website: "website",
  };
  debugger;
  const filteredOrders = TodayOrders.filter((order) => {
    if (order.order_source == "EPOS") {
      return (
        order.order_type === typeMapping[statusType] &&
        order.order_source === sourceMapping[orderSource]
      );
    } else {
      return (
        order.order_type === typeMappingWeb[localStatus] &&
        order.order_source === sourceMapping[orderSource]
      );
    }
  });
  const filteredOrdersSorted = [...filteredOrders].sort((a, b) => {
    const statusOrder = { yellow: 1, green: 2, blue: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  if (statusType == "TakeAway" && orderSource == "EPOS") {
    imageSrc = TakeAway;
    label = "Take Aways";
  } else if (statusType == "Delivery" && orderSource == "EPOS") {
    imageSrc = Delivery;
    label = "Deliveries";
  } else if (statusType == "DineIn" && orderSource == "EPOS") {
    imageSrc = DineIn;
    label = "Dine Ins";
  } else if (statusType == "pickup" && orderSource == "Website") {
    imageSrc = Website;
    label = "Website";
  } else if (statusType == "delivery" && orderSource == "Website") {
    imageSrc = Website;
    label = "Website";
  }
  // Status-based color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "green":
        return "bg-[#DEF5D4]";
      case "yellow":
        return "bg-[#FFF6D4]";
      case "red":
        return "bg-red-200";
      case "blue":
        return "bg-[#D6D6D6]";
      default:
        return "bg-gray-200";
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

  const handleChangeStatus = (st) => {
    setlocalStatus(st);
    console.log(st);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(null);
    setSelectedOrder(order);
    console.log("Selected Order:", order);
  };

  return (
    <div className="grid grid-cols-3">
      <div className="col-span-2 flex flex-col items-center my-4">
        <div className="text-center mb-6">
          {imageSrc && (
            <div className="flex justify-center items-center space-x-4">
              <img
                src={imageSrc}
                alt={label}
                className="w-auto h-20 object-contain p-4"
                style={{ backgroundColor: "#000000", borderRadius: "20px" }}
              />
              <span
                className="text-5xl font-semibold py-4 px-8 text-white"
                style={HeadingStyle}
              >
                {label}
              </span>
            </div>
          )}
        </div>
        {orderSource == "Website" && (
          <div className="flex justify-between space-x-4 mb-4">
            <button
              onClick={() => handleChangeStatus("delivery")}
              className="text-2xl font-semibold py-2 px-8 text-white"
              style={HeadingStyle}
            >
              Deliveries
            </button>
            <button
              onClick={() => handleChangeStatus("pickup")}
              className="text-2xl font-semibold py-2 px-8 text-white"
              style={HeadingStyle}
            >
              Pickups
            </button>
          </div>
        )}

        <div className="max-w-[90%] w-full px-4 overflow-y-auto h-full custom-scrollbar">
          {filteredOrders.length === 0 ? (
            <p className="text-gray-500 text-center">
              No {label} orders found.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredOrdersSorted.map((order, index) => (
                <div
                  key={order.order_id}
                  className="flex items-center space-x-2"
                >
                  <span
                    className="text-black font-semibold text-5xl mr-5 w-5"
                    style={NumberStyle}
                  >
                    {index + 1}
                  </span>
                  <div
                    className={`flex-1 p-5 cursor-pointer text-3xl ${getStatusColor(
                      order.status
                    )}`}
                    onClick={() => handleSelectOrder(order)}
                    style={AddressStyle}
                  >
                    {order.order_type === "delivery" ? (
                      `${order.postal_code}, ${order.street_address}`
                    ) : (
                      <>
                        {order.items?.[0]?.item_name || ""}
                        {order.items?.[1]
                          ? `, ${order.items[1].item_name}`
                          : ""}
                        {order.items?.length > 2 && "..."}
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      debugger;
                      // Replace this logic with your actual condition
                      if (order.status === "yellow") {
                        handleStatusChange(order.order_id, "green");
                      } else if (order.status === "green") {
                        handleStatusChange(order.order_id, "blue");
                      }
                    }}
                    className={`flex-2 px-6 py-5  cursor-pointer text-3xl ${getStatusColor(
                      order.status
                    )}`}
                    style={AddressStyle}
                  >
                    {order.status === "yellow"
                      ? "Pending"
                      : order.status === "green"
                      ? (localStatus === "delivery" &&
                          orderSource == "Website") ||
                        statusType === "Delivery"
                        ? "On its way"
                        : localStatus === "pickup"
                        ? "Ready"
                        : "Ready"
                      : order.status === "blue"
                      ? "Completed"
                      : "Unknown"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1 px-10 pt-6 border-l h-[90vh] border-gray-600 mt-4">
        <div className="border-b border-gray-600 pb-6">
          {" "}
          <div className="flex justify-between " style={AddressCartStyle}>
            <span>{selectedOrder?.postal_code}</span>
            <span> Order no. {selectedOrder?.order_id}</span>
          </div>
          <div style={AddressCartStyle}>{selectedOrder?.street_address}</div>
          <div style={AddressCartStyle}>{selectedOrder?.county}</div>
          <div style={AddressCartStyle}>{selectedOrder?.customer_name}</div>
          <div style={AddressCartStyle}>{selectedOrder?.phone_number}</div>
        </div>
        <div className="border-b border-gray-600 pb-6 h-[55%] overflow-y-auto custom-scrollbar">
          {selectedOrder?.items.map((item) => (
            <div className="grid grid-cols-7 py-2" key={item.item_id}>
              <div className="col-span-1 text-4xl" style={NumberStyle}>
                {item.quantity}
              </div>
              <div
                className="col-span-4 border-r border-gray-600 "
                style={DescriptionStyle}
              >
                {item.item_description}
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
                  {item.item_name}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3">
          <div
            className="flex col-span-2 p-4 m-4 text-white text-2xl justify-center items-center"
            style={TotalAmountStyle}
          >
            Total amount: {selectedOrder?.order_total_price}
          </div>
          <div
            className="flex col-span-1 p-4 m-4 text-white text-2xl justify-center items-center"
            style={TotalAmountStyle}
          >
            <img
              className="h-16 lg:h-16 w-auto"
              src={printer}
              alt={"PRINTER"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStatus;
