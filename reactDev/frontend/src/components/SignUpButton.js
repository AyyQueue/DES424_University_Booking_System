import React from "react";

export default function SignUpButton({setSignUpModalActive, user}) {
  
   const openLoginPage = () => {setSignUpModalActive(true);};

  return (
    <button className="btn" onClick={openLoginPage} style={ user ? {display: 'none'} : {display: 'inline-block'} }>
      Sign Up
    </button>
  );
}
