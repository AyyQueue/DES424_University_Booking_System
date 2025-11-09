// RoomsSection.js
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import RoomCard from "./RoomCard";
import SearchBar from "./SeachBar";

export default function RoomsSection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL;
  const { user, setUser } = useContext(UserContext); // keep original shape

  // States that will use in the search bar for filtering as well
  const [q, setQ] = useState("");           // text search: name/building/room
  const [building, setBuilding] = useState("");
  const [minCap, setMinCap] = useState(""); // numeric string; empty = ignore
  // (optional) features later if you want:
  // const [features, setFeatures] = useState([]);

  // ---- paging (unchanged) ----
  const [page, setPage] = useState(1);
  const pageSize = 5; // your test size

  useEffect(() => {
    if (!user) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoading(true);
      try {
        // ORIGINAL working call: GET /rooms with sessionKey header
        const response = await fetch(`${serverUrl}/rooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sessionKey: user?.sessionKey || "",
          },
        });

        // If your backend expects POST with body instead, swap to:
        // const response = await fetch(`${serverUrl}/rooms`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ sessionKey: user?.sessionKey || "" }),
        // });

        if (response.status === 401) {
          // optional: auto sign-out on invalid session
          setUser?.(null);
          setRooms([]);
          return;
        }

        const data = await response.json();
        setRooms(Array.isArray(data) ? data : []);
        setPage(1); // reset to first page on reload
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setRooms([]); // clear on error
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user, serverUrl, setUser]);

  if (loading) return <p>Loading rooms...</p>;

  // ---- NEW: client-side filtering (minimal, fast, safe) ----
  const filtered = (() => {
    const needle = q.trim().toLowerCase();
    const min = Number(minCap) || 0;

    return rooms.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const bld  = (r.buildingCode || "").toLowerCase();
      const num  = (r.roomNumber || "").toLowerCase();
      const cap  = Number(r.capacity ?? r.capicity ?? 0);

      if (needle && !(name.includes(needle) || bld.includes(needle) || num.includes(needle))) return false;
      if (building && bld !== building.toLowerCase()) return false;
      if (min && cap < min) return false;

      return true;
    });
  })();

  // ---- existing pagination over the filtered list ----
  const total = filtered.length;
  const startIdx = total ? (page - 1) * pageSize : 0;
  const endIdx = total ? Math.min(startIdx + pageSize, total) : 0;
  const pageRooms = filtered.slice(startIdx, endIdx);

  const canPrev = page > 1;
  const canNext = endIdx < total;

  const gotoPrev = () => { if (canPrev) setPage((p) => p - 1); };
  const gotoNext = () => { if (canNext) setPage((p) => p + 1); };

  return (
    <section id="rooms">
      <div className="container">
        <h2 className="section-title">Available Rooms</h2>

        {/* Minimal search bar; your component can ignore unused props */}
        <SearchBar
          q={q}
          onQ={(v) => { setPage(1); setQ(v); }}
          building={building}
          onBuilding={(v) => { setPage(1); setBuilding(v); }}
          minCap={minCap}
          onMinCap={(v) => { setPage(1); setMinCap(v); }}
          onSubmit={() => setPage(1)}
        />

        {total === 0 ? (
          <p>No rooms found.</p>
        ) : (
          <>
            <div className="rooms-grid">
              {pageRooms.map((room) => (
                <RoomCard key={room.idRooms} room={room} />
              ))}
            </div>

            {/* existing pager UI */}
            <div
              className="rooms-pager"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "16px",
                justifyContent: "center",
              }}
            >
              <button onClick={gotoPrev} disabled={!canPrev} className="btn btn-outline">
                Go left
              </button>
              <span className="pager-text">
                room {total ? startIdx + 1 : 0}-{endIdx} of {total}
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
