import React from "react";

export default function SignInButton({ user, setUser, setSignInModalActive }) {

  const openLoginPage = () => {setSignInModalActive(true);};

  const logOut = () => setUser(null);

  return (
    <button className="btn" onClick={user ? logOut : openLoginPage}>
      {user ? `${user} - Sign Out` : "Sign In"}
    </button>
  );
}
