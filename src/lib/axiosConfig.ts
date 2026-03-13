import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Crucial: This tells axios to send cookies
});

// Keep auth errors local to the caller (route guards/forms handle navigation)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
