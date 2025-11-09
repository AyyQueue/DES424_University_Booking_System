import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling, Error
import bcrypt
import secrets
from datetime import datetime, timedelta
import os

# Create a connection pool at startup
dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": "root", # Change this to your own root password (In my case)
    "database": "RoomBookingDB",
    "port": 3306
}

# pool_name and pool_size can be adjusted based on traffic
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        **dbconfig
    )
except Error as e:
    print("Error connecting to MySQL:", e)
    connection_pool = None

# Initialize Flask app
app = Flask(__name__)

# allows React frontend on different port to fetch registerData
CORS(app, supports_credentials=True)

allowed = re.compile(r'^[a-zA-Z0-9!@#$%^&*()_\-+=]+$')

@app.route("/hello", methods=["GET"])
def hello():
    return "Hello from BackendServer!"

#run login() when POST request is made to /login
@app.route("/login", methods=["POST"])
def login():
    loginData = request.get_json()
    username = loginData.get("username", "").strip()
    password = loginData.get("password", "").strip()
    
    # Get a connection from the pool
    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)  # so we can access columns by name

    try:
        # Look up the user by username
        cursor.execute("SELECT idUsers, username, passwordHash FROM Users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "failure", "message": "Invalid username or password"})

        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), user['passwordHash'].encode('utf-8')):
            # Password correct, generate a session key
            sessionKey = secrets.token_hex(16)

            # Optionally, update the sessionKey in DB
            cursor.execute("UPDATE Users SET sessionKey = %s WHERE idUsers = %s", (sessionKey, user['idUsers']))
            conn.commit()

            return jsonify({
                "status": "success",
                "message": "OK",
                "username": user['username'],
                "sessionKey": sessionKey
            })
        else:
            return jsonify({"status": "failure", "message": "Invalid username or password"})

    finally:
        cursor.close()
        conn.close()

#run register() when POST request is made to /register
@app.route("/register", methods=["POST"])
def register():
    registerData = request.get_json()
    username = registerData.get("username", "").strip()
    password = registerData.get("password", "").strip()

    # --- Basic validation ---
    if len(username) < 1:
        return jsonify({"status": "failure", "message": "Invalid username"})
    elif re.search(r'[^a-zA-Z0-9!@#$%^&*()_\-+=]', username) or re.search(r'[^a-zA-Z0-9!@#$%^&*()_\-+=]', password):
        return jsonify({"status": "failure", "message": "Allowed special-chars: !@#$%^&*()_-+="})
    elif len(password) < 3:
        return jsonify({"status": "failure", "message": "Password must have at least 3 characters"})

    try:
        # --- Get a connection from the pool ---
        conn = connection_pool.get_connection()
        cursor = conn.cursor(dictionary=True)

        # --- Check if username already exists ---
        cursor.execute("SELECT idUsers FROM Users WHERE username = %s", (username,))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"status": "failure", "message": "Username already taken"})

        # --- Hash password (important!) ---
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # --- Insert new user ---
        cursor.execute("""
            INSERT INTO Users (username, passwordHash, sessionKey, createdAt, authorityLevel)
            VALUES (%s, %s, '', NOW(), 1)
        """, (username, password_hash.decode('utf-8')))

        conn.commit()

        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "username": username
        })

    except Error as e:
        print("❌ Database error:", e)
        return jsonify({"status": "failure", "message": "Database error"})

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route("/rooms", methods=["GET"])
def get_rooms():
    sessionKey = request.headers.get("sessionKey")
    if not sessionKey:
        return jsonify({"error": "No session key provided"}), 401

    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check user session and get authority
        cursor.execute("SELECT idUsers, username, authorityLevel FROM Users WHERE sessionKey = %s", (sessionKey,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "Invalid sessionKey"}), 401

        user_authority = user["authorityLevel"]

        # Fetch rooms user has access to
        cursor.execute("""
            SELECT idRooms, name, capicity, imageURL
            FROM Rooms
            WHERE accesLevel <= %s
        """, (user_authority,))
        rooms = cursor.fetchall()

        # Attach features to each room
        for room in rooms:
            cursor.execute("""
                SELECT f.name
                FROM RoomFeatures rf
                JOIN Features f ON rf.featureId = f.idFeatures
                WHERE rf.roomId = %s
            """, (room['idRooms'],))
            features = [f['name'] for f in cursor.fetchall()]
            room['features'] = features
            room['image'] = room.pop('imageURL')
            room['capacity'] = room.pop('capicity')

        return jsonify(rooms)

    except Error as e:
        print("❌ Database error:", e)
        return jsonify({"error": "Database error"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/view-bookings", methods=["GET"])
def view_bookings():
    session_key = request.headers.get('sessionKey')
    if not session_key:
        return jsonify({"status": "failure", "message": "No session key provided"}), 401

    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify session
        cursor.execute("""
            SELECT idUsers, username 
            FROM Users 
            WHERE sessionKey = %s
        """, (session_key,))
        
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "failure", "message": "Invalid session"}), 401

        # Get bookings - note the column names match the DB schema
        cursor.execute("""
            SELECT 
                b.idBookings,
                b.startTime,
                b.endTime,
                b.status,
                r.name as roomName,
                r.capicity as capacity,
                r.buildingCode,
                r.roomNumber,
                r.imageURL
            FROM Bookings b
            JOIN Rooms r ON b.roomId = r.idRooms
            WHERE b.userId = %s
            ORDER BY b.startTime ASC
        """, (user['idUsers'],))

        bookings = cursor.fetchall()

        # Format datetime objects for JSON
        for booking in bookings:
            booking['startTime'] = booking['startTime'].strftime('%Y-%m-%d %H:%M')
            booking['endTime'] = booking['endTime'].strftime('%Y-%m-%d %H:%M')

        return jsonify({
            "status": "success",
            "bookings": bookings
        })

    except Error as e:
        print("Database error:", e)
        return jsonify({
            "status": "failure",
            "message": "Database error"
        }), 500

    finally:
        cursor.close()
        conn.close()


def normalize_local_sql_dt(s: str) -> str:
    """
    Accepts:
      - 'YYYY-MM-DDTHH:MM' / 'YYYY-MM-DDTHH:MM:SS'
      - 'YYYY-MM-DD HH:MM' / 'YYYY-MM-DD HH:MM:SS'
      - with optional fractional seconds and/or trailing 'Z'
    Returns canonical local-naive: 'YYYY-MM-DD HH:MM:SS'
    """
    if s is None:
        raise ValueError("datetime is None")
    s = str(s).strip()
    s = s.replace("T", " ")
    s = s.split("Z")[0]         # drop trailing Z
    s = s.split(".")[0]         # drop fractional seconds
    if len(s) == 16:            # 'YYYY-MM-DD HH:MM'
        s += ":00"
    # validate shape
    datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
    return s
@app.route("/bookings", methods=["POST"])   
def create_booking():
    # auth: header 'sessionKey' or form fallback
    session_key = request.headers.get("sessionKey") or request.form.get("sessionKey")
    if not session_key:
        return jsonify({"status": "failure", "message": "No session key provided"}), 401

    # accept JSON or form
    data = request.get_json(silent=True) or {}
    room_id = data.get("roomId") or request.form.get("roomId")
    start_str = data.get("startTime") or request.form.get("startTime")
    end_str   = data.get("endTime") or request.form.get("endTime")            # optional
    duration  = data.get("durationMinutes") or request.form.get("durationMinutes")  # optional

    # debug to see what you actually received
    print("POST /bookings payload:",
          {"roomId": room_id, "startTime": start_str, "endTime": end_str, "duration": duration})

    if not room_id:
        return jsonify({"status": "failure", "message": "roomId is required"}), 400
    if not start_str:
        return jsonify({"status": "failure", "message": "startTime is required"}), 400

    # normalize + parse start (never call helper without an arg)
    try:
        start_str = normalize_local_sql_dt(start_str)
        start_dt  = datetime.strptime(start_str, "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        print("normalize start error:", e)
        return jsonify({"status": "failure", "message": "Invalid startTime"}), 400

    # derive end time: prefer durationMinutes; else accept explicit endTime
    if duration not in (None, "", []):
        try:
            mins = int(duration)
            if mins <= 0:
                return jsonify({"status": "failure", "message": "durationMinutes must be > 0"}), 400
        except Exception:
            return jsonify({"status": "failure", "message": "durationMinutes must be an integer"}), 400
        end_dt = start_dt + timedelta(minutes=mins)
        end_str = end_dt.strftime("%Y-%m-%d %H:%M:%S")
    else:
        if not end_str:
            return jsonify({"status": "failure", "message": "Provide endTime or durationMinutes"}), 400
        try:
            end_str = normalize_local_sql_dt(end_str)
            end_dt  = datetime.strptime(end_str, "%Y-%m-%d %H:%M:%S")
        except Exception as e:
            print("normalize end error:", e)
            return jsonify({"status": "failure", "message": "Invalid endTime"}), 400

    if not (start_dt < end_dt):
        return jsonify({"status": "failure", "message": "endTime must be after startTime"}), 400

    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # verify session -> user
        cursor.execute("""
            SELECT idUsers, authorityLevel
            FROM Users
            WHERE sessionKey = %s
        """, (session_key,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "failure", "message": "Invalid session"}), 401

        # room exists (optional access check)
        cursor.execute("SELECT accesLevel FROM Rooms WHERE idRooms = %s", (room_id,))
        if not cursor.fetchone():
            return jsonify({"status": "failure", "message": "Room not found"}), 404

        # conflict check
        cursor.execute("""
            SELECT COUNT(*) AS cnt
            FROM Bookings
            WHERE roomId = %s
              AND NOT (endTime <= %s OR startTime >= %s)
              AND status <> 'cancelled'
        """, (room_id, start_dt, end_dt))
        if cursor.fetchone()["cnt"] > 0:
            return jsonify({"status": "failure", "message": "Time slot already booked"}), 409

        # insert
        cursor.execute("""
            INSERT INTO Bookings (roomId, userId, startTime, endTime, status, createdAt)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (room_id, user["idUsers"], start_dt, end_dt, "confirmed"))
        conn.commit()
        booking_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "message": "Booking created",
            "bookingId": booking_id,
            "roomId": room_id,
            "startTime": start_str,
            "endTime": end_str
        }), 201

    except Error as e:
        print("❌ Database error:", e)
        return jsonify({"status": "failure", "message": "Database error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/cancel-booking", methods=["POST"])
def cancel_booking():
    data = request.get_json()
    booking_id = data.get("bookingId")
    session_key = request.headers.get("sessionKey")

    if not booking_id:
        return jsonify({"status": "failure", "message": "No booking ID provided"}), 400
    if not session_key:
        return jsonify({"status": "failure", "message": "No session key provided"}), 401

    conn = connection_pool.get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Verify user session
        cursor.execute("SELECT idUsers FROM Users WHERE sessionKey = %s", (session_key,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "failure", "message": "Invalid session"}), 401

        # Optional: make sure the booking belongs to this user
        cursor.execute("SELECT * FROM Bookings WHERE idBookings = %s AND userId = %s", 
                       (booking_id, user["idUsers"]))
        booking = cursor.fetchone()
        if not booking:
            return jsonify({"status": "failure", "message": "Booking not found"}), 404

        # Only cancel if not already canceled
        if booking["status"].lower() == "canceled":
            return jsonify({"status": "failure", "message": "Booking already canceled"}), 400

        # Update booking status
        cursor.execute("UPDATE Bookings SET status = 'Canceled' WHERE idBookings = %s", (booking_id,))
        conn.commit()

        return jsonify({"status": "success", "message": "Booking canceled"})
    except Error as e:
        print("Database error:", e)
        return jsonify({"status": "failure", "message": "Database error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/rooms/search", methods=["GET"])
def search_rooms():
    session_key = request.headers.get("sessionKey")
    if not session_key:
        return jsonify({"status": "failure", "message": "No session key provided"}), 401

    conn = connection_pool.get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # verify session -> authority level
        cur.execute("""
            SELECT idUsers, authorityLevel
            FROM Users
            WHERE sessionKey = %s
        """, (session_key,))
        user = cur.fetchone()
        if not user:
            return jsonify({"status": "failure", "message": "Invalid session"}), 401
        user_auth_level = user["authorityLevel"]

        # ---- parse query params ----
        q         = (request.args.get("q") or "").strip()
        building  = (request.args.get("building") or "").strip()
        cap_min   = request.args.get("capacity_min", type=int)
        features  = [f.strip() for f in (request.args.get("features","").split(",") if request.args.get("features") else [])]
        date_str  = (request.args.get("date") or "").strip()  # YYYY-MM-DD
        page      = max(1, request.args.get("page", default=1, type=int))
        size      = min(50, request.args.get("size", default=12, type=int))
        off       = (page - 1) * size

        where = ["r.accesLevel <= %s"]
        params = [user_auth_level]

        if q:
            # case-insensitive substring match across name, buildingCode, roomNumber
            where.append("(UPPER(r.name) LIKE %s OR UPPER(r.buildingCode) LIKE %s OR UPPER(r.roomNumber) LIKE %s)")
            k = f"%{q.upper()}%"
            params += [k, k, k]

        if building:
            # case-insensitive substring on buildingCode
            where.append("UPPER(r.buildingCode) LIKE %s")
            params.append(f"%{building.upper()}%")

        if cap_min is not None:
            where.append("r.capicity >= %s") 
            params.append(cap_min)

        # features filter (room must have all requested features to match)
        join_features = ""
        if features:
            ph = ",".join(["%s"] * len(features))
            join_features = f"""
              JOIN (
                SELECT rf.roomId, COUNT(*) c
                FROM RoomFeatures rf
                JOIN Features f ON rf.featureId = f.idFeatures
                WHERE UPPER(f.name) IN ({ph})
                GROUP BY rf.roomId
              ) fx ON fx.roomId = r.idRooms AND fx.c = {len(features)}
            """
            params += [f.upper() for f in features]

        # availability on the given date: exclude rooms that have a non-cancelled booking that day
        exclude_busy = ""
        if date_str:
            exclude_busy = """
              AND NOT EXISTS (
                SELECT 1
                FROM Bookings b
                WHERE b.roomId = r.idRooms
                  AND DATE(b.startTime) = %s
                  AND b.status <> 'cancelled'
              )
            """
            params.append(date_str)

        base = f"""
          FROM Rooms r
          {join_features}
          WHERE {" AND ".join(where)} {exclude_busy}
        """

        # total
        cur.execute(f"SELECT COUNT(*) AS cnt {base}", params)
        total = cur.fetchone()["cnt"]

        # page
        cur.execute(f"""
          SELECT r.idRooms, r.name, r.capicity AS capacity,
                 r.imageURL AS image, r.buildingCode, r.roomNumber
          {base}
          ORDER BY r.name
          LIMIT %s OFFSET %s
        """, params + [size, off])
        rooms = cur.fetchall()

        # attach the features for each room
        for r in rooms:
            cur.execute("""
              SELECT f.name
              FROM RoomFeatures rf
              JOIN Features f ON rf.featureId = f.idFeatures
              WHERE rf.roomId = %s
            """, (r["idRooms"],))
            r["features"] = [row["name"] for row in cur.fetchall()]

        return jsonify({"status": "success", "total": total, "page": page, "size": size, "rooms": rooms})

    except Error as e:
        print("❌ Database error:", e)
        return jsonify({"status": "failure", "message": "Database error"}), 500
    finally:
        cur.close()
        conn.close()


# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    app.run(debug=True)
    #port = int(os.environ.get("PORT", 8080))
    #app.run(host="0.0.0.0", port=port)