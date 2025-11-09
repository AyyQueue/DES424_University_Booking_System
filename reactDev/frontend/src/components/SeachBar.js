import React from "react";

export default function SearchBar({ q, onQ, building, onBuilding, minCap, onMinCap, onSearch }) {
  return (
    <div className="rooms-filters" style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 140px 160px auto", marginBottom: 12 }}>
      <input placeholder="Search by name/building/room…" value={q} onChange={(e)=>onQ(e.target.value)} />
      <input placeholder="Building" value={building} onChange={(e)=>onBuilding(e.target.value)} />
      <input type="number" min="1" placeholder="Min capacity" value={minCap} onChange={(e)=>onMinCap(e.target.value)} />
      <button className="btn" onClick={onSearch}>Search</button>
    </div>
  );
}
