// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import axios from "axios";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;

root.render(<App />);
