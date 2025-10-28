import React, { useState, useEffect } from "react";

export default function SignUpModal({signUpModalActive, setSignUpModalActive }) {

    const [registerMSG, setRegisterMSG] = useState("");
    const [registerError, setRegisterError] = useState(false);
    const [loading, setLoading] = useState(false);

    // Global cursor effect
    useEffect(() => {
        document.body.style.cursor = loading ? "wait" : "auto";
        return () => {
            // cleanup when component unmounts
            document.body.style.cursor = "auto";
        };
    }, [loading]);

    // Disable background scrolling when modal is active
    useEffect(() => {
        document.body.style.overflow = signUpModalActive ? "hidden" : "auto";
    }, [signUpModalActive]);

    const closeModal = (e) => {
        // Only close if the click is directly on the overlay
        if (e.target === e.currentTarget) {
            setSignUpModalActive(false);
            setRegisterError(false);
            setRegisterMSG("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page from reloading on submit
        setLoading(true); // show loading cursor

        // Get form data
        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: {"Content-Type": "application/json", },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                // Server responded, but with an error code (like 404, 500, etc.)
                setRegisterMSG(`Server error: ${response.status}`);
                return;
            }

            const registerData = await response.json();

            if (registerData.status == "success") {
                setRegisterError(false);
                setRegisterMSG(`Account ${registerData.username} created`);
            }
            else {
                setRegisterError(true);
                setRegisterMSG(registerData.message);
            }

        } catch (error) {
            // This runs if fetch fails entirely (e.g., server is offline)
            setRegisterError(true);
            setRegisterMSG("Server is offline");
        } finally {
            setLoading(false); // remove loading cursor
            e.target.reset(); // <-- clear all inputs in the form
        }
    }

    return (
        <div className={`modal ${signUpModalActive ? "active" : ""}`} onClick={closeModal} id="signUpModal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Sign Up</h3>
                    <button className="close-modal" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                    <form id="signupForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "60%" }}>
                        <input name="username" placeholder="Username" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }} />
                        <input name="password" type="password" placeholder="Password" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }} />

                    </form>
                </div>
                <div className="modal-footer">
                    <p className={registerError ? "errorText" : "succesText"}>{registerMSG}</p>
                    <button type="submit" form="signupForm"
                        style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: loading ? "#999" : "#2563eb",
                            color: "white",
                            border: "none",
                            cursor: loading ? "wait" : "pointer",
                        }}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
