
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MsalProvider } from "@azure/msal-react";
import {msalConfig} from "../src/auth/authConfig.ts";
import { PublicClientApplication } from "@azure/msal-browser";

const msalInstance = new PublicClientApplication(msalConfig);

createRoot(document.getElementById('root')!).render(
<MsalProvider instance={msalInstance}>
  <App />
</MsalProvider>
)
