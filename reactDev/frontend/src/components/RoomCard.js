// src/components/RoomCard.js
import React, { useState, useContext, useMemo } from "react";
import { UserContext } from "../UserContext";

export default function RoomCard({ room }) {
  const { user } = useContext(UserContext);
  const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL;

  const [open, setOpen] = useState(false);
  const [startLocal, setStartLocal] = useState(""); // "YYYY-MM-DDTHH:MM"
  const [duration, setDuration] = useState(60);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const features = Array.isArray(room?.features)
    ? room.features
    : typeof room?.features === "string" && room.features.length
      ? room.features.split(",").map((s) => s.trim())
      : [];

  // Build strings once; no duplicate consts
  const startSQL = useMemo(
    () => (startLocal ? startLocal.replace("T", " ") + ":00" : ""),
    [startLocal]
  );

  const endPreview = useMemo(() => {
    if (!startLocal) return "";
    const d = new Date(startLocal + ":00");
    const e = new Date(d.getTime() + duration * 60000);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(e.getHours())}:${pad(e.getMinutes())}`;
  }, [startLocal, duration]);

  async function handleBook() {
    setMsg("");

    if (!user?.sessionKey) {
      setMsg("Please sign in first.");
      return;
    }
    if (!startLocal) {
      setMsg("Pick a start date & time.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${serverUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          sessionKey: user.sessionKey, // or move to cookie/form if avoiding CORS
        },
        body: JSON.stringify({
          roomId: room.idRooms || room.id,
          startTime: startSQL,          // "YYYY-MM-DD HH:MM:SS"
          durationMinutes: duration,    // server computes endTime
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      setMsg("✅ Booking created!");
    } catch (e) {
      console.error("Booking error:", e);
      setMsg(`❌ ${e.message || "Failed to fetch"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="room-card">
      <div
        className="room-image"
        style={{ backgroundImage: `url(${room.image || ""})` }}
      />
      <div className="room-info">
        <h3>{room.name}</h3>

        <div className="room-capacity">
          <i className="fas fa-users"></i>
          <span>Capacity: {room.capacity} people</span>
        </div>
        

        <div className="room-features">
          {(features ?? []).length ? (
            features.map((f) => (
              <span key={f} className="room-feature">
                {f}
              </span>
            ))
          ) : (
            <span className="room-feature">No features listed</span>
          )}
        </div>

        {!open ? (
          <button
            className="btn book-btn"
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={() => setOpen(true)}
          >
            Book Now
          </button>
        ) : (
          <div className="inline-booking" style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <label className="form-label">
              Start (date & time)
              <input
                type="datetime-local"
                className="form-input"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
              />
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[30, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn btn-outline ${m === duration ? "active" : ""}`}
                  onClick={() => setDuration(m)}
                >
                  {m} min
                </button>
              ))}
            </div>

            <div style={{ fontSize: 14, opacity: 0.85 }}>
              {startLocal ? (
                <>Selected: {startSQL} → {endPreview} ({duration} min)</>
              ) : (
                <>Pick a start date & time</>
              )}
            </div>

            {msg && (
              <div
                className="alert"
                style={{
                  fontSize: 14,
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: msg.startsWith("✅") ? "1px solid #bdf2dd" : "1px solid #f5b5b5",
                  background: msg.startsWith("✅") ? "#e8fff5" : "#fdecec",
                  color: msg.startsWith("✅") ? "#0a5" : "#b00020",
                }}
              >
                {msg}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => { setOpen(false); setMsg(""); }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleBook} disabled={submitting || !startLocal}>
                {submitting ? "Booking…" : "Book this time"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
