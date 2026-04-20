import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { createRoot } from "react-dom/client";
import { msalConfig } from "../src/auth/authConfig";
import App from "./App";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

// 🔥 IMPORTANTE: inicializar MSAL antes de renderizar
msalInstance.initialize().then(() => {
  createRoot(document.getElementById("root")!).render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
});