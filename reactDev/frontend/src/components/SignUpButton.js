import React from "react";

export default function SignUpButton({user, setUser}) {
  
  return (
    <button className="btn" onClick={() => alert("Sign up window to open")} style={ user ? {display: 'none'} : {display: 'inline-block'} }>
      Sign Up
    </button>
  );
}
