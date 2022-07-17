import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_AJAX_BASE_URL,
});

export default http;
