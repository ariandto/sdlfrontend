// src/api/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://srviot.ariandto.cloud/api", // sesuaikan dengan backend kamu
  withCredentials: true,
});

export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default apiClient;
