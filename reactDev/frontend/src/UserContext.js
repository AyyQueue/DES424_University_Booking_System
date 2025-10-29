import React, { createContext, useState, useEffect } from "react";

// Create the context
export const UserContext = createContext();

// Context Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from sessionStorage on first load
    const sessionKey = sessionStorage.getItem("sessionKey");
    const username = sessionStorage.getItem("username");
    return sessionKey ? { username, sessionKey } : null;
  });

  // Sync to sessionStorage whenever user state changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("sessionKey", user.sessionKey);
      sessionStorage.setItem("username", user.username);
    } else {
      sessionStorage.removeItem("sessionKey");
      sessionStorage.removeItem("username");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};