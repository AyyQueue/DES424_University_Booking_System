import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling, Error
import bcrypt
import secrets
import os

# Create a connection pool at startup
dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": "admin",
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
CORS(app)  

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

@app.route("/rooms", methods=["POST"])
def get_rooms():
    requestData = request.get_json()
    sessionKey = requestData.get("sessionKey")

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
            room['image'] = room.pop('imageURL')  # rename to match frontend
            room['capacity'] = room.pop('capicity')  # rename to match frontend

        return jsonify(rooms)

    except Error as e:
        print("❌ Database error:", e)
        return jsonify({"error": "Database error"}), 500

    finally:
        cursor.close()
        conn.close()







# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    app.run(debug=True)
    #port = int(os.environ.get("PORT", 8080))
    #app.run(host="0.0.0.0", port=port)