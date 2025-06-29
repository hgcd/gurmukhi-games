from flask import Flask, render_template, request, redirect, url_for, session, flash
from functools import wraps
import os
import json
from datetime import timedelta, datetime
import itertools
from collections import Counter
from flask import jsonify
from analytics import *
from db_connection import MongoDBConnection
app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Get the MongoDB database instance
db = MongoDBConnection.get_db()

global GAME_DETAILS
GAME_DETAILS = [
    {
        "game_id": "akhar-recognition",
        "name": "Akhar Recognition",
        "description": "Practice identifying Gurmukhi letters by sound",
        "color_class": "bg-orange-light",
        "icon": "🎯"
    },
    {
        "game_id": "akhar-line-order",
        "name": "Akhar Line Order",
        "description": "Put the akhar in the correct order",
        "color_class": "bg-blue-light",
        "icon": "🔤"
    },
    {
        "game_id": "audio-spelling",
        "name": "Audio Spelling",
        "description": "Practice spelling Gurmukhi letters by listening to their audio pronunciation",
        "color_class": "bg-red-light",
        "icon": "🎧"
    },
    {
        "game_id": "color-memory",
        "name": "Color Memory",
        "description": "Match colors with their Gurmukhi names",
        "color_class": "bg-orange-light",
        "icon": "🎨"
    },
    {
        "game_id": "akhar-elimination-grid",
        "name": "Akhar Elimination Grid",
        "description": "Practice identifying and eliminating Gurmukhi letters",
        "color_class": "bg-green-light",
        "icon": "🔍"
    }
]

# Get all users
def get_users_dict():
    users = db.users.find({}, {"_id": 0, "user_id": 1, "type": 1, "points": 1})
    return {
        user['user_id']: user
        for user in users
    }

global USERS
USERS = get_users_dict()
print("Loaded users: ", USERS)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_id = request.form.get('user_id').lower()
        print("Attempting to login with user_id: ", user_id)

        # Refresh users
        USERS = get_users_dict()

        if user_id in USERS:
            session['user_id'] = user_id
            session['user_name'] = user_id
            session['user_type'] = USERS[user_id]['type']
            session['points'] = USERS[user_id]['points']
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Invalid User ID')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    # Refresh all users
    USERS = get_users_dict()

    # Generate all-time leaderboard
    alltime_leaderboard = []
    for user_id, user_data in USERS.items():
        if USERS[user_id]["type"] == "student" and USERS[user_id]["points"] > 0:
            alltime_leaderboard.append({
                'id': user_id,
                'points': user_data['points']
            })

    alltime_leaderboard.sort(key=lambda x: x['points'], reverse=True)
    alltime_leaderboard = alltime_leaderboard[:5]

    # Generate daily leaderboard
    all_records = db.activity_records.find({"datetime": {"$gte": datetime.now()}})
    user_points = {}
    for record in all_records:
        if record['user_id'] in user_points:
            user_points[record['user_id']] += record['points']
        else:
            user_points[record['user_id']] = record['points']
    
    daily_leaderboard = []
    for user_id, points in user_points.items():
        daily_leaderboard.append({
            'id': user_id,
            'points': points
        })

    daily_leaderboard.sort(key=lambda x: x['points'], reverse=True)
    daily_leaderboard = daily_leaderboard[:5]

    # Get all game details
    game_details = [
        game for game in GAME_DETAILS
        if game['game_id'] in ["akhar-recognition", "akhar-elimination-grid", "audio-spelling"]
    ]
    return render_template(
        'index.html',
        alltime_leaderboard=alltime_leaderboard,
        game_details=game_details,
        daily_leaderboard=daily_leaderboard
    )

@app.route('/activities/audio-spelling')
def audio_spelling():
    return render_template('activities/audio_spelling.html')

@app.route('/games')
@login_required
def games():
    return render_template('games.html', game_details=GAME_DETAILS)

@app.route('/analytics')
@login_required
def analytics():
    return render_template('analytics.html')

@app.route('/activities/color-memory')
@login_required
def color_memory():
    return render_template('activities/color_memory.html')

@app.route('/activities/akhar-recognition')
@login_required
def akhar_recognition():
    return render_template('activities/akhar_recognition.html')

@app.route('/activities/akhar-elimination-grid')
@login_required
def akhar_elimination_grid():
    return render_template('activities/akhar_elimination_grid.html')

@app.route('/activities/akhar-line-order')
@login_required
def akhar_line_order():
    return render_template('activities/akhar_line_order.html')

@app.route('/activities/batch-tracing')
@login_required
def batch_tracing():
    return render_template('activities/batch_tracing.html')

#### API ROUTES ####

@app.route('/register-activity', methods=['POST'])
def register_activity():
    try:
        data = request.get_json()

        # Activity data
        activity_data = {
            "user_id": session.get('user_id', None),
            "datetime": datetime.now(),
            "name": data.get('name', None),
            "points": int(data.get('points', 0)),
            "categories": data.get('categories', None),
            "stats": data.get('stats', {})
        }

        if not activity_data['user_id'] or not activity_data['name'] or activity_data['points'] == None or not activity_data['categories']:
            print("Missing required fields:", activity_data)
            return jsonify({"success": False, "message": "Missing required fields"}), 400

        # Insert the activity data into the database
        db.activity_records.insert_one(activity_data)

        # Update user points
        update_user_points(session.get('user_id', None))

        print("Activity registered successfully")
        return jsonify({"success": True, "message": "Activity registered successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

def update_user_points(user_id):
    all_user_points = db.activity_records.find({"user_id": user_id}, {"points": 1})
    total_points = sum([
        item['points'] for item in all_user_points
        if item['points'] is not None
    ])
    db.users.update_one({"user_id": user_id}, {"$set": {"points": total_points}})

    # Refresh user points in session
    session['points'] = total_points

    print("Successfully updated user points to ", total_points)

@app.route('/get-analytics')
def get_analytics():
    # Get filter data from request
    student_id = request.args.get('student_id', None)
    game = request.args.get('game', None)
    category = request.args.get('category', None)
    recency = request.args.get('recency', None)

    # Load all data from learn_stats.json
    data = get_all_activity_data()

    # Get all values
    user_ids = list(set(item['user_id'] for item in data))
    games = list(set(item['name'] for item in data))
    categories = list(set(itertools.chain(*[item['categories'] for item in data])))

    # Filter for all provided filters
    if student_id and student_id.lower() != 'all':
        print("Filtering by student_id: ", student_id)
        data = [item for item in data if item['user_id'] == student_id]
    if game and game.lower() != 'all':
        print("Filtering by game: ", game)
        data = [item for item in data if item['name'] == game]
    if category and category.lower() != 'all':
        print("Filtering by category: ", category)
        data = [item for item in data if category in item['categories']]
    if recency and recency.lower() != 'all':
        print("Filtering by recency: ", recency)
        current_date = datetime.now().date()
        if recency == 'today':
            data = [item for item in data if item['datetime'].date() == current_date]
        elif recency == 'last_week':
            data = [item for item in data if item['datetime'].date() >= current_date - timedelta(days=7)]
        elif recency == 'last_month':
            data = [item for item in data if item['datetime'].date() >= current_date - timedelta(days=30)]
    
    print("Generating analytics from ", len(data), " items")
    
    analytics_data = {
        'all_user_ids': user_ids,
        'selected_user_id': student_id,
        'all_games': games,
        'selected_game': game,
        'all_categories': categories,
        'selected_category': category,
        "usage_stats": get_usage_stats(data) if data else None,
        'activity_stats': get_activity_stats(data) if data else None,
        'akhar_stats': get_akhar_stats(data) if data else None
    }
    
    return jsonify(analytics_data)

# Add user context to all templates
@app.context_processor
def inject_user():
    return {
        'user_id': session.get('user_id'),
        'user_name': session.get('user_name'),
        'user_points': session.get('points'),
        'user_type': session.get('user_type')
    }

if __name__ == '__main__':
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', debug=DEBUG) 