// customFetch.js
import { FRONTEND_ID } from "./config";

const customFetch = (url, options = {}) => {
  const defaultHeaders = {
    "x-client-id": FRONTEND_ID,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
};

export default customFetch;
