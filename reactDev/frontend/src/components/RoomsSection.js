// RoomsSection.js
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";
import RoomCard from "./RoomCard";

export default function RoomsSection({}) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const serverUrl = process.env.REACT_APP_BACKENDSERVER_URL;
    const { user, setUser } = useContext(UserContext);

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
                setRooms(data);
            } catch (err) {
                console.error("Error fetching rooms:", err);
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

    return (
        <section id="rooms">
            <div className="container">
                <h2 className="section-title">Available Rooms</h2>
                <div className="rooms-grid">
                    {Array.isArray(rooms) ? rooms.map((room) => (
                        <RoomCard key={room.idRooms} room={room} />
                    )) : <p>No rooms available.</p>}
                </div>
            </div>
        </section>
    );
}
