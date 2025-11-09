// RoomsSection.js
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import RoomCard from "./RoomCard";
import SearchBar from "./SeachBar";

export default function RoomsSection() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL;
    const { user, setUser } = useContext(UserContext);

    // States that will use in the search bar for filtering rooms
    const [q, setQ] = useState("");           // text search: name/building/room
    const [building, setBuilding] = useState(""); // **NOTE that this part is not used in the backend yet** because of building filtering may not be implemented yet.
    const [minCap, setMinCap] = useState(""); // numeric string; empty = ignore
    // (optional) features later if you want to implement in the search bar (BUT not added into the searchbar UI or logic yet)
    // const [features, setFeatures] = useState([]);

    // ---- paging (unchanged) ----
    const [page, setPage] = useState(1);
    const pageSize = 5; // The default test size is 5 to see room per pages (Adjustable to any number)

    useEffect(() => {
      if (!user) {
        setRooms([]);
        return;
      }

      const fetchRooms = async () => {
        setLoading(true);
        try {
          // call GET /rooms with sessionKey header
          const response = await fetch(`${serverUrl}/rooms`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              sessionKey: user?.sessionKey || "",
            },
          });
          
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

    // Fast filtering on the client side (Renders when rooms, q, building, minCap change)
    const filtered = (() => {
      const needle = q.trim().toLowerCase();
      const bNeedle = building.trim().toLowerCase();   // normalize once
      const min = Number(minCap) || 0;

      return rooms.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const bld  = (r.buildingCode || "").toLowerCase();
      const num  = (r.roomNumber || "").toLowerCase();
      const cap  = Number(r.capacity ?? r.capicity ?? 0);

      if (needle && !(name.includes(needle) || bld.includes(needle) || num.includes(needle))) return false;
      if (bNeedle && !bld.includes(bNeedle)) return false;   // substring match, not strict equal
      if (min && cap < min) return false;

      return true;
    });
  })();


  // existing pagination over the filtered list 
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

        {/* Minimal search bar; the component can ignore unused props */}
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
