import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_AJAX_URL,
  withCredentials: true,
});

export default http;
