import type { AccountInfo } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
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
        const accs = instance.getAllAccounts();
        if (accs.length > 0) {
          instance.setActiveAccount(accs[0]);
          setAccount(accs[0]);
        }
      }
    });
  }, [instance]);

  if (!account) return <Login />;

  return <Home />;
}

export default App;
