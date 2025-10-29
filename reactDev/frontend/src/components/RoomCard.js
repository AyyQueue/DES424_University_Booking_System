// RoomCard.js
import React from "react";

export default function RoomCard({ room }) {
  return (
    <div className="room-card">
      <div className="room-image" style={{ backgroundImage: `url(${room.image})` }}></div>
      <div className="room-info">
        <h3>{room.name}</h3>
        <div className="room-capacity">
          <i className="fas fa-users"></i>
          <span>Capacity: {room.capacity} people</span>
        </div>
        <div className="room-features">
          {room.features.map((f, i) => (
            <span key={i} className="room-feature">
              {f}
            </span>
          ))}
        </div>
        <button className={"btn book-btn"} style={{ width: "100%", marginTop: "1rem" }}>
            Book Now
        </button>
      </div>
    </div>
  );
}
