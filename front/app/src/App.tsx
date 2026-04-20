import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import type { AccountInfo } from "@azure/msal-browser";
import Home from "../src/pages/home";
import Login from "../src/pages/login";

function App() {
  const { instance } = useMsal();
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    instance.handleRedirectPromise().then((response) => {
      if (response?.account) {
        instance.setActiveAccount(response.account);
        setAccount(response.account);
      } else {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          setAccount(accounts[0]);
        }
      }
    });
  }, [instance]);

  if (!account) return <Login />;

  return <Home />;
}

export default App;