import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RootStoreProvider, rootStore } from "./store";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootStoreProvider value={rootStore}>
      <App />
    </RootStoreProvider>
  </React.StrictMode>
);
