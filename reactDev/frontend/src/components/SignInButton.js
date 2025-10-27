import React, { useState } from "react";

export default function SignInButton() {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    const response = await fetch("http://127.0.0.1:5000/login", { method: "POST" });
    const data = await response.json();
    setUser(data.username);
  };

  const handleLogout = () => setUser(null);

  return (
    <button onClick={user ? handleLogout : handleLogin}>
      {user ? `${user} - Sign Out` : "Sign In"}
    </button>
  );
}
