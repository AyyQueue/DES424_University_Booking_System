import React, { useContext } from "react";
import { UserContext } from "../UserContext";

export default function BookingsModal({ show, onClose, bookings, setBookings }) {

  const { user } = useContext(UserContext);
  const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL || "http://localhost:5000";
  if (!show) return null;

  const handleCancelBooking = async (bookingId) => {

    if (!user || !user.sessionKey) {
      alert("You must be logged in to cancel bookings");
      return;
    }

    try {
      const res = await fetch(`${serverUrl}/cancel-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sessionKey": user.sessionKey 
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setBookings((prev) =>
          prev.map((b) =>
            b.idBookings === bookingId || b.id === bookingId
              ? { ...b, status: "Canceled" }
              : b
          )
        );
      } else {
        alert(data.message || "Could not cancel booking");
      }
    } catch (err) {
      console.error("Cancel booking failed:", err);
      alert("Failed to cancel booking. Try again.");
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="modal active" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">My Bookings</h3>
          <button className="close-modal" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {bookings.length === 0 ? (
            <p>You have no bookings yet.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const roomName = booking.roomName || booking.room_name || "Unknown room";
                const building = booking.buildingCode || booking.building_code || "";
                const roomNumber = booking.roomNumber || booking.room_number || "";
                const status = (booking.status || "").toString();

                const isCanceled = status.toLowerCase() === "canceled";

                return (
                  <div
                    key={booking.idBookings || booking.id || JSON.stringify(booking)}
                    className="booking-item-card"
                  >
                    <div className="booking-details">
                      <h4>{roomName}</h4>
                      {building || roomNumber ? (
                        <p className="room-locationInfo">
                          ({building}{roomNumber && ` - Room ${roomNumber}`})
                        </p>
                      ) : null}
                      <p className="booking-time">
                        {/*<i className="fas fa-clock" aria-hidden="true"></i>{" "}*/}
                        <strong>From: </strong>
                        {formatDateTime(booking.startTime)}
                      </p>
                      <p className="booking-time">
                        <strong>To: </strong>
                        {formatDateTime(booking.endTime)}
                      </p>
                    </div>

                    <div className="booking-actions">
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status.toUpperCase()}
                      </span>
                      <button
                        className="btn btn-danger cancel-btn"
                        disabled={isCanceled}
                        onClick={() =>
                          handleCancelBooking(booking.idBookings)
                        }
                      >
                        {isCanceled ? "Canceled" : "Cancel"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
