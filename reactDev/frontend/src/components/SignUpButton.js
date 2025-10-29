import React, { useContext } from "react";
import { UserContext } from "../UserContext";

export default function SignUpButton({ setSignUpModalActive }) {
  const { user, setUser } = useContext(UserContext);
  const openLoginPage = () => { setSignUpModalActive(true); };

  return (
    <button className="btn" onClick={openLoginPage} style={user ? { display: 'none' } : { display: 'inline-block' }}>
      Sign Up
    </button>
  );
}
