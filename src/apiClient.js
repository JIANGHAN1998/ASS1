// src/apiClient.js
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000
});
export default api;
