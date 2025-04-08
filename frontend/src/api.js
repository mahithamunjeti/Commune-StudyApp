import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

export const registerUser = async (userData) => {
  return await axios.post(`${API_BASE_URL}/user`, userData);
};

export const loginUser = async (credentials) => {
  return await axios.post(`${API_BASE_URL}/login`, credentials);
};
