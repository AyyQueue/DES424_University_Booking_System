import React, { useContext } from "react";
import { UserContext } from "../UserContext";

export default function SignInButton({setSignInModalActive }) {

  const { user, setUser } = useContext(UserContext);

  const openLoginPage = () => setSignInModalActive(true);

  const logOut = () => setUser(null);

  return (
    <button className="btn" onClick={user ? logOut : openLoginPage}>
      {user ? `${user.username} - Sign Out` : "Sign In"}
    </button>
  );
}
