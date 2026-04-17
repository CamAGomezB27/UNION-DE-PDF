export const msalConfig = {
  auth: {
    clientId: "TU_CLIENT_ID",
    authority: "https://login.microsoftonline.com/TU_TENANT_ID",
    redirectUri: "http://localhost:5173",
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All", "Sites.ReadWrite.All"],
};