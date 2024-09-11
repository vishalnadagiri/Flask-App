from flask import Flask, render_template, request, jsonify, abort

app = Flask(__name__)

# Sample API list
available_apis = ["API 1", "API 2", "API 3", "API 4"]

# Simulate a database with a dictionary
users_db = {
    "user1": ["API 1", "API 2"],
    "user2": ["API 3", "API 4"]
}

@app.route('/')
def index():
    """
    Renders the main page with the list of available APIs.
    """
    return render_template('index.html', apis=available_apis)

@app.route('/add_user', methods=['POST'])
def add_user():
    """
    Adds a user with a list of APIs to the simulated database.
    """
    user_id = request.form.get('user_id')
    apis = request.form.getlist('apis')

    # Validate input
    if not user_id or not apis:
        return jsonify(success=False, message="User ID and APIs are required"), 400

    # Add user or update existing user
    users_db[user_id] = apis
    return jsonify(success=True)

@app.route('/remove_user', methods=['POST'])
def remove_user():
    """
    Removes specified APIs from a user's list or deletes the user if no APIs are left.
    """
    user_id = request.form.get('user_id')
    apis = request.form.getlist('apis')

    # Validate input
    if not user_id or not apis:
        return jsonify(success=False, message="User ID and APIs are required"), 400

    # Check if user exists
    if user_id not in users_db:
        return jsonify(success=False, message="User not found"), 404

    # Remove specified APIs
    user_apis = users_db.get(user_id, [])
    users_db[user_id] = [api for api in user_apis if api not in apis]

    # Remove user if no APIs left
    if not users_db[user_id]:
        del users_db[user_id]

    return jsonify(success=True)

@app.route('/get_user_apis', methods=['POST'])
def get_user_apis():
    """
    Retrieves the list of APIs for a specific user.
    """
    user_id = request.form.get('user_id')

    # Validate input
    if not user_id:
        return jsonify(success=False, message="User ID is required"), 400

    apis = users_db.get(user_id, [])

    return jsonify(apis=apis)

if __name__ == '__main__':
    app.run(debug=True)
