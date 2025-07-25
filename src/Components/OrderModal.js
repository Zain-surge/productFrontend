import React from "react";
import { addOrder } from "../store/ordersSlice";
import { useSelector, useDispatch } from "react-redux";
import { updateOrderStatus } from "../store/ordersSlice";

export default function OrderModal({ order, onAccept }) {
  const TodayOrders = useSelector((state) => state.orders.todayOrders);
  const dispatch = useDispatch();

  const handleAcceptClick = () => {
    console.log("TODAY ORDERS BEFORE", TodayOrders);
    // Add order to Redux
    dispatch(addOrder(order));
    console.log("TODAY ORDERS BEFORE", TodayOrders);
    // Call the passed onAccept function for any additional logic (e.g., closing modal)
    if (onAccept) onAccept();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 100 }}
    >
      <div className="bg-[#F2D9F9] rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center">
          {/* <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">UE</span>
          </div> */}
          <span
            className="text-lg font-medium"
            style={{
              fontFamily: "Bambino",
              fontWeight: 350,
            }}
          >
            Order {order.order_id}
          </span>
        </div>

        {/* Order Items */}
        <div className="px-6 py-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start">
              <div className="flex-1">
                <div
                  className="font-medium text-gray-900"
                  style={{
                    fontFamily: "Bambino",
                    fontWeight: 350,
                  }}
                >
                  {item.item_name}
                </div>
                {item.quantity > 1 && (
                  <div
                    className="text-sm text-gray-600"
                    style={{
                      fontFamily: "Bambino",
                      fontWeight: 350,
                    }}
                  >
                    Qty: {item.quantity}
                  </div>
                )}
              </div>
              <div
                className="text-right font-medium text-gray-900"
                style={{
                  fontFamily: "Bambino",
                  fontWeight: 350,
                }}
              >
                £{item.total_price}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="px-6 py-2  space-y-2">
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-600">
            <span
              className="text-gray-900"
              style={{
                fontFamily: "Bambino",
                fontWeight: 550,
              }}
            >
              Total
            </span>
            <span
              className="text-gray-900"
              style={{
                fontFamily: "Bambino",
                fontWeight: 550,
              }}
            >
              £{order.total_price}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-6 py-3  text-sm space-y-1">
          <div>
            <span
              className="font-medium"
              style={{
                fontFamily: "Bambino",
                fontWeight: 350,
              }}
            >
              Customer:
            </span>{" "}
            {order.customer_name}
          </div>
          <div>
            <span
              className="font-medium"
              style={{
                fontFamily: "Bambino",
                fontWeight: 350,
              }}
            >
              Phone:
            </span>{" "}
            {order.customer_phone}
          </div>
          <div>
            <span
              className="font-medium"
              style={{
                fontFamily: "Bambino",
                fontWeight: 350,
              }}
            >
              Type:
            </span>{" "}
            {order.order_type}
          </div>

          {order.extra_notes && (
            <div>
              <span
                className="font-medium"
                style={{
                  fontFamily: "Bambino",
                  fontWeight: 350,
                }}
              >
                Notes:
              </span>{" "}
              {order.extra_notes}
            </div>
          )}
        </div>

        {/* Accept Button */}
        <div className="p-6">
          <button
            onClick={handleAcceptClick}
            style={{
              fontFamily: "Bambino",
              fontWeight: 650,
            }}
            className="w-full bg-[#CB6CE6] text-black font-semibold py-4 rounded-xl text-lg transition-colors duration-200 shadow-lg"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
