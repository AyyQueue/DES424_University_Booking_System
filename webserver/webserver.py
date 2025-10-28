from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# allows React frontend on different port to fetch data
CORS(app)  

USERNAME = "Mads"
PASSWORD = "123"

#run login() when POST request is made to /login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # Parse JSON body
    username = data.get("username")
    password = data.get("password")

    if username==USERNAME and password==PASSWORD:
        return jsonify({
            "status": "success",
            "message":"OK", 
            "username": "Mads", 
            "sessionKey": "abc123"
        })
    else:
        return jsonify({
            "status": "failure",
            "message": "Invalid username or password"
        })

# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    app.run(debug=True)