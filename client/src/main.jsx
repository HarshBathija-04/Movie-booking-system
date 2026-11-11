import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#1e1b26", color: "#f3eee6", border: "1px solid #3d3849", fontSize: "14px" },
            success: { iconTheme: { primary: "#3ccbb4", secondary: "#0c0b10" } },
            error: { iconTheme: { primary: "#ef5b6f", secondary: "#0c0b10" } },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
