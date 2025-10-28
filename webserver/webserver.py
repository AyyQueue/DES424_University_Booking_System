import re
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# allows React frontend on different port to fetch data
CORS(app)  

USERNAME = "Mads"
PASSWORD = "123"
allowed = re.compile(r'^[a-zA-Z0-9!@#$%^&*()_\-+=]+$')

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
            "username": username, 
            "sessionKey": "abc123"
        })
    else:
        return jsonify({
            "status": "failure",
            "message": "Invalid username or password"
        })

#run register() when POST request is made to /register
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()  # Parse JSON body
    username = data.get("username") #Save
    password = data.get("password") #Save

    
    if len(username) < 1:
        return jsonify({
            "status": "failure",
            "message": "Invalid username"
        })
    elif re.search(r'[^a-zA-Z0-9!@#$%^&*()_\-+=]', username) or re.search(r'[^a-zA-Z0-9!@#$%^&*()_\-+=]', password):
        return jsonify({
            "status": "failure",
            "message": "Allowed special-chars: !@#$%^&*()_-+="
        })
    elif len(password) < 3:
        return jsonify({
            "status": "failure",
            "message": "Password must have at least 3 characters"
        })    
    elif username!=USERNAME:
        return jsonify({
            "status": "success",
            "message":"OK", 
            "username": username, 
        })
    else:
        return jsonify({
            "status": "failure",
            "message": "Username already taken"
        })

# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    app.run(debug=True)