import React, { useState } from 'react';
import { colors } from '../colors';
import axiosInstance from '../axiosInstance';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [canceling, setCanceling] = useState(false);



  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/orders/track/${orderId}`); // Sort orders: latest first, but cancelled orders at the bottom
      
      const sortedOrders = response.data.sort((a, b) => { 
        // If one is cancelled and the other isn't, cancelled goes to bottom
        if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
        if (b.status === 'cancelled' && a.status !== 'cancelled') return -1;
        
        // If both have same cancellation status, sort by created_at (latest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setOrders(sortedOrders);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Order not found");
      } else {
        setError("Failed to fetch order details");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchOrderId.trim()) {
      fetchOrderDetails(searchOrderId.trim());
    }
  };

  // Handle Enter key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Check if order can be cancelled (within 10 minutes of creation)
  const canCancelOrder = (orderData) => {
    if (!orders.length > 0 || orderData.status === "cancelled" || orderData.status === "blue") {
      return false;
    }

    const orderTime = new Date(orderData.created_at);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderTime) / (1000 * 60); // difference in minutes

    return timeDifference <= 10;
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderData) => {
    if (!orderData || !canCancelOrder(orderData)) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    setCanceling(true);
    try {
      await axiosInstance.post("/orders/cancel", { order_id: orderData.order_id });
      await fetchOrderDetails(orderData.customer.phone_number); // re-fetch by phone
    } catch (err) {
      setError("Failed to cancel order");
    } finally {
      setCanceling(false);
    }
  };


  // Determine order status and progress step
  const getOrderProgress = (orderData) => {
    if (!orderData) return { step: 0, statusText: 'Unknown' };
    const { status, driver, order_type } = orderData;

    switch (status) {
      case 'cancelled':
        return { step: 0, statusText: 'Order Cancelled' };

      case 'red':
        return { step: 1, statusText: 'Order Received - Being Prepared' };

      case 'yellow':
      case 'orange':
        return { step: 2, statusText: 'Order Ready' };

      case 'green':
        if (order_type === 'delivery') {
          return driver?.driver_id
            ? { step: 3, statusText: 'On Its Way' }
            : { step: 3, statusText: 'Driver Assigned' };
        } else {
          return { step: 3, statusText: 'Ready for Pickup' };
        }

      case 'blue':
        return {
          step: 4,
          statusText: order_type === 'delivery' ? 'Delivered' : 'Completed'
        };

      default:
        return { step: 0, statusText: 'Unknown Status' };
    }
  };

  const { step, statusText } = getOrderProgress();

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Progress steps configuration


  // Reset tracking state
  const resetTracking = () => {
    setOrders([]);
    setSearchOrderId('');
    setError(null);
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ paddingTop: '120px' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Bambino' }}
          >
            Track Your Order
          </h1>

          {/* Search Input */}
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter Mobile Number"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ fontFamily: 'Bambino' }}
              />
              <button
                onClick={handleSearch}
                disabled={!searchOrderId.trim() || loading}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{
                  backgroundColor: colors.primaryGreen,
                  fontFamily: 'Bambino',
                  fontWeight: 600
                }}
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600" style={{ fontFamily: 'Bambino' }}>
              Loading order details...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
            <div className="text-red-600 mb-2">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2" style={{ fontFamily: 'Bambino' }}>
              {error}
            </h3>
            <p className="text-red-600" style={{ fontFamily: 'Bambino' }}>
              Please check your order ID and try again.
            </p>
          </div>
        )}

        {/* Order Details Section */}
        {orders.length > 0 && !loading && (
          <div className="space-y-12">
            {orders.map((orderData) => {
              const { step, statusText } = getOrderProgress(orderData);

              const progressSteps = [
                {
                  number: 1,
                  title: 'Order Received',
                  description: 'Your order has been placed'
                },
                {
                  number: 2,
                  title: 'Preparing',
                  description: 'Your order is being prepared'
                },
                {
                  number: 3,
                  title: orderData?.order_type === 'delivery' ? 'On Its Way' : 'Ready for Pickup',
                  description: orderData?.order_type === 'delivery' ? 'Driver is on the way' : 'Ready for collection'
                },
                {
                  number: 4,
                  title: 'Completed',
                  description: orderData?.order_type === 'delivery' ? 'Order delivered' : 'Order collected'
                }
              ];

              return (
                <div key={orderData.order_id} className="space-y-6 border-b pb-8 last:border-b-0">
                  {/* === Paste your single order JSX here === */}
                  {/* Replace all global `orderData` calls with this local one */}
                  {/* Example: */}
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{
                        fontFamily: 'Bambino',
                        color: orderData.status === 'cancelled' ? colors.primaryRed : colors.primaryGreen
                      }}
                    >
                      {statusText}
                    </h2>
                    <p className="text-gray-600">Order #{orderData.order_id}</p>

                    {canCancelOrder(orderData) && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleCancelOrder(orderData)}
                          disabled={canceling}
                          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                          style={{
                            backgroundColor: colors.primaryRed,
                            fontFamily: 'Bambino',
                            fontWeight: 600
                          }}
                        >
                          {canceling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Bambino' }}>
                          Orders can only be cancelled within 10 minutes of placement
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ... keep the rest of your JSX (progress tracker, order details, items, etc.) ... */}
                  {/* Progress Tracker - Only show if not cancelled */}
                  {orderData.status !== 'cancelled' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded"></div>
                        <div
                          className="absolute top-5 left-0 h-1 rounded transition-all duration-500"
                          style={{
                            backgroundColor: colors.primaryGreen,
                            width: `${Math.max(0, ((step - 1) / (progressSteps.length - 1)) * 100)}%`
                          }}
                        ></div>

                        {/* Steps */}
                        <div className="relative flex justify-between">
                          {progressSteps.map((stepItem) => {
                            const isCompleted = stepItem.number <= step;
                            const stepColor = isCompleted ? colors.primaryGreen : '#E5E7EB';
                            const textColor = isCompleted ? colors.primaryGreen : '#9CA3AF';

                            return (
                              <div key={stepItem.number} className="flex flex-col items-center max-w-[120px]">
                                <div
                                  className="w-10 h-10 rounded-full border-4 bg-white flex items-center justify-center text-sm font-bold transition-all duration-300 mb-2"
                                  style={{
                                    borderColor: stepColor,
                                    color: textColor
                                  }}
                                >
                                  {isCompleted ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    stepItem.number
                                  )}
                                </div>
                                <p
                                  className="text-sm font-semibold text-center"
                                  style={{
                                    color: textColor,
                                    fontFamily: 'Bambino'
                                  }}
                                >
                                  {stepItem.title}
                                </p>
                                <p
                                  className="text-xs text-center mt-1"
                                  style={{
                                    color: textColor,
                                    fontFamily: 'Bambino'
                                  }}
                                >
                                  {stepItem.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Order Message */}
                  {orderData.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <div className="text-red-600 mb-2">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-red-800 mb-2" style={{ fontFamily: 'Bambino' }}>
                        Order Cancelled
                      </h3>
                      <p className="text-red-600" style={{ fontFamily: 'Bambino' }}>
                        This order has been cancelled. If you have any questions, please contact us.
                      </p>
                    </div>
                  )}

                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Order Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Bambino' }}>
                        Order Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Order Type:</span>
                          <span className="capitalize">{orderData.order_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span>£{orderData.total_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Payment:</span>
                          <span>{orderData.payment_type == 'Cash on Delivery' ? 'Cash on Delivery' : 'Card'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Ordered:</span>
                          <span>{formatDate(orderData.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <span className="capitalize" style={{
                            color: orderData.status === 'cancelled' ? colors.primaryRed : colors.primaryGreen
                          }}>
                            45 mins - 1 hour
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Bambino' }}>
                        Your Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Name:</span>
                          <span>{orderData.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Phone:</span>
                          <span>{orderData.customer.phone_number}</span>
                        </div>
                        {orderData.order_type === 'delivery' && orderData.customer.street_address && (
                          <div className="pt-2">
                            <p className="font-medium mb-1">Delivery Address:</p>
                            <p className="text-gray-600">
                              {orderData.customer.street_address}<br />
                              {orderData.customer.city}, {orderData.customer.county}<br />
                              {orderData.customer.postal_code}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Driver Information - Only show if not cancelled and driver exists */}
                  {orderData.driver && orderData.status !== 'cancelled' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Bambino' }}>
                        Contact Us
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <a
                            href="tel:+441254205542"
                            className="hover:underline text-inherit"
                          >
                            +44 1254 205542
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Bambino' }}>
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {orderData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium">{item.item_name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold ml-4">£{item.total_price}</p>
                        </div>
                      ))}
                    </div>

                    {orderData.extra_notes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold">Special Instructions:</span> {orderData.extra_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Track Another Order Button */}
                  <div className="text-center">
                    <button
                      onClick={resetTracking}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: colors.primaryRed,
                        fontFamily: 'Bambino',
                        fontWeight: 600
                      }}
                    >
                      Track Another Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        )}

        {/* Welcome Message */}
        {!orders.length > 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Bambino' }}>
              Track Your Order
            </h3>
            <p className="text-gray-500" style={{ fontFamily: 'Bambino' }}>
              Enter your mobile number above to track your order status and get real-time updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;