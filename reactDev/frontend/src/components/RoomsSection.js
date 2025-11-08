// RoomsSection.js
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import RoomCard from "./RoomCard";

export default function RoomsSection({}) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL;
    const { user, setUser } = useContext(UserContext);

    const [page, setPage] = useState(1);
    const pageSize = 5; // Number of rooms per page (Default I set to 5 to test)
    useEffect(() => {
        if (!user) {
            // User logged out, clear rooms
            setRooms([]);
            return; // don’t fetch anything
    }

        const fetchRooms = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${serverUrl}/rooms`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ sessionKey: user?.sessionKey}),
                });
                const data = await response.json();
                setRooms(Array.isArray(data) ? data : []);
                setPage(1); // This reset first page whenever the list is reloaded.
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setRooms([]); // Clear rooms on error
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [user, serverUrl]);

    // Optionally, show a message if user is not logged in
    //   if (!user) {
    //     return <p>Please log in to see available rooms.</p>;
    //   }

    if (loading) {
        return <p>Loading rooms...</p>;
    }
    
    const total = rooms.length;
  const startIdx = total ? (page - 1) * pageSize : 0;
  const endIdx = total ? Math.min(startIdx + pageSize, total) : 0;
  const pageRooms = rooms.slice(startIdx, endIdx);

  const canPrev = page > 1;
  const canNext = endIdx < total;

  const gotoPrev = () => { if (canPrev) setPage(p => p - 1); };
  const gotoNext = () => { if (canNext) setPage(p => p + 1); };

    return (
        <section id="rooms">
            <div className="container">
                <h2 className="section-title">Available Rooms</h2>

                {total === 0 ? (
                    <p>No rooms available.</p>
            ) : (
          <>
            <div className="rooms-grid">
              {pageRooms.map(room => (
                <RoomCard key={room.idRooms} room={room} />
              ))}
            </div>

            {/* Load more / pagination controls */}
            <div className="rooms-pager" style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px", justifyContent: "center" }}>
              <button onClick={gotoPrev} disabled={!canPrev} className="btn btn-outline">
                Go left
              </button>
              <span className="pager-text">
                room {startIdx + 1}-{endIdx} of {total}
              </span>
              <button onClick={gotoNext} disabled={!canNext} className="btn btn-outline">
                Go right
              </button>
            </div>
          </>
        )}
            </div>
        </section>
    );
}
