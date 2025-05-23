import React from "react";

export default function OrderModal({ order, onAccept }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          🛎️ New Order Received
        </h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Order ID:</span> {order.order_id}
          </p>
          <p>
            <span className="font-medium">Customer:</span> {order.customer_name}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {order.customer_phone}
          </p>
          <p>
            <span className="font-medium">Order Type:</span> {order.order_type}
          </p>
          <p>
            <span className="font-medium">Payment Type:</span>{" "}
            {order.payment_type}
          </p>
          <p>
            <span className="font-medium">Total:</span> £{order.total_price}
          </p>
          <p>
            <span className="font-medium">Notes:</span>{" "}
            {order.extra_notes || "None"}
          </p>

          <div>
            <p className="font-medium">Items:</p>
            <ul className="list-disc list-inside pl-2">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.quantity} x {item.item_name} (£{item.total_price})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onAccept}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition"
          >
            Accept Order
          </button>
        </div>
      </div>
    </div>
  );
}
