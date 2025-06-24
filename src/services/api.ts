import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "X-RapidAPI-Key":
      import.meta.env.VITE_RAPIDAPI_KEY || "your-rapidapi-key-here",
    "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Please try again later.");
    } else if (error.response?.status >= 500) {
      console.error("Server error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
