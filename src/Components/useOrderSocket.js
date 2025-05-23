// Components/useOrderSocket.js
import { useEffect, useRef } from "react";

export default function useOrderSocket(onOrderReceived) {
  const ws = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket("ws://thevillage-backend.onrender.com"); // Use your actual WS server URL and port

      ws.current.onopen = () => {
        console.log("WebSocket connected ✅");
      };

      ws.current.onmessage = (event) => {
        const order = JSON.parse(event.data);
        console.log("Order received via WebSocket:", order); // console.log instead of printing
        onOrderReceived(order);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error.message);
      };

      ws.current.onclose = () => {
        console.log("WebSocket closed, reconnecting in 3 seconds...");
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [onOrderReceived]);
}
