import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

export default function BookingsModal({ show, onClose, bookings }) {
  // Add formatDateTime helper function
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "—";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Invalid date:', dateTimeStr);
      return dateTimeStr; // fallback to raw string
    }
  };

  if (!show) return null;

  return (
    <div className="modal active" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">My Bookings</h3>
          <button className="close-modal" onClick={onClose} aria-label="Close">&times;</button>
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

                return (
                  <div key={booking.idBookings || booking.id || JSON.stringify(booking)} className="booking-item">
                    <div className="booking-room">
                      <h4>{roomName}</h4>
                      {building || roomNumber ? <p>{building} {roomNumber && `- Room ${roomNumber}`}</p> : null}
                    </div>
                    <div className="booking-time">
                      <p>
                        <i className="fas fa-clock" aria-hidden="true"></i>{" "}
                        {formatDateTime(booking.startTime)} — {formatDateTime(booking.endTime)}
                      </p>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
