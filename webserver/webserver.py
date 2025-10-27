from flask import Flask, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# allows React frontend on different port to fetch data
CORS(app)  


#run login() when POST request is made to /login
@app.route("/login", methods=["POST"])
def login():
    # For now, just return a fake username
    return jsonify({"username": "Mads"})

# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    app.run(debug=True)