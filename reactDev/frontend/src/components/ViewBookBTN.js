import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";

export default function ViewBookBTN({ setBookings, setShowModal }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL || "http://localhost:5000";

  if (!user || !user.sessionKey) return null;

  const handleViewBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/view-bookings`, {
        headers: { "Content-Type": "application/json", "sessionKey": user.sessionKey }
      });
      const data = await res.json();
      if (data.status === "success") {
        setBookings(data.bookings || []);
        setShowModal(true);
      } else {
        alert(data.message || "Could not load bookings");
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      alert("Could not load bookings. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-bookings-container">
      <button
        className="btn view-bookings-btn"
        onClick={handleViewBookings}
        disabled={loading}
      >
        <i className="fas fa-calendar-alt"></i> {loading ? "Loading..." : "View My Bookings"}
      </button>
    </div>
  );
}
