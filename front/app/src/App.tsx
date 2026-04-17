import { useMsal } from "@azure/msal-react";
import Home from "../src/pages/home";
import Login from "../src/pages/login";

function App() {
  const { accounts } = useMsal();

  if (accounts.length === 0) {
    return <Login />;
  }

  return <Home />;
}

export default App;