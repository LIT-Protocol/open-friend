import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Theme, presetGpnDefault } from "@consta/uikit/Theme";
import LitJsSdk from "lit-js-sdk";

window.litNodeClient = new LitJsSdk.LitNodeClient({
  alertWhenUnauthorized: false,
});
window.litNodeClient.connect();
window.LitJsSdk = LitJsSdk;

ReactDOM.render(
  <React.StrictMode>
    <Theme preset={presetGpnDefault}>
      <App />
    </Theme>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
