import React, { useState, useEffect } from "react";

export default function SignInModal({ user, setUser, signInModalActive, setSignInModalActive }) {

    const [loginErrorMSG, setloginErrorMSG] = useState("");
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
        document.body.style.overflow = signInModalActive ? "hidden" : "auto";
    }, [signInModalActive]);

    const closeModal = (e) => {
        // Only close if the click is directly on the overlay
        if (e.target === e.currentTarget) {
            setSignInModalActive(false);
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
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // tell server we're sending JSON
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                // Server responded, but with an error code (like 404, 500, etc.)
                setloginErrorMSG("Server error:", response.status);

                return;
            }

            const loginData = await response.json();

            if (loginData.status == "success") {
                setUser(loginData.username);
                setSignInModalActive(false);
                setloginErrorMSG("");
            }
            else {
                setloginErrorMSG("Wrong username or password");
            }

        } catch (error) {
            // This runs if fetch fails entirely (e.g., server is offline)
            setloginErrorMSG("Server is offline");
        } finally {
            setLoading(false); // remove loading cursor
            e.target.reset(); // <-- clear all inputs in the form
        }
    }

    return (
        <div className={`modal ${signInModalActive ? "active" : ""}`} onClick={closeModal} id="signInModal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">Sign In</h3>
                    <button className="close-modal" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                    <form id="loginForm" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "60%" }}>
                        <input name="username" placeholder="Username" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }} />
                        <input name="password" type="password" placeholder="Password" style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }} />

                    </form>
                </div>
                <div className="modal-footer">
                    <p>{loginErrorMSG}</p>
                    <button type="submit" form="loginForm"
                        style={{
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: loading ? "#999" : "#2563eb",
                            color: "white",
                            border: "none",
                            cursor: loading ? "wait" : "pointer",
                        }}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
