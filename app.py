from flask import Flask, render_template, request, redirect, url_for, session, flash
from functools import wraps
import os
import json
from datetime import timedelta, datetime
import itertools
from collections import Counter
from bson import json_util
from flask import jsonify
from analytics import *
from db_connection import MongoDBConnection
app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for session management

# Get the MongoDB database instance
db = MongoDBConnection.get_db()

# Get all game details
def get_game_details():
    games = db.games.find({}, {
        "_id": 0,
        "game_id": 1,
        "name_english": 1,
        "name_punjabi": 1,
        "description_english": 1,
        "description_punjabi": 1,
        "color_class": 1,
        "icon": 1,
        "whitelist_class_ids": 1,
        "blacklist_user_ids": 1,
        "skills": 1
    })
    games = [json.loads(json_util.dumps(game)) for game in games]

    # Filter
    if session.get('user_type') in ['student', 'teacher']:
        # Filter by class id
        games = [game for game in games if game['whitelist_class_ids'] == ['*'] or session.get('user_class_id') in game['whitelist_class_ids']]
        
        # Filter by user id
        games = [game for game in games if session.get('user_id') not in game['blacklist_user_ids']]

    # Sort by game id
    games.sort(key=lambda x: x['game_id'])
    
    return games

# Get all users
def get_users_dict():
    users = db.users.find({}, {"_id": 0, "user_id": 1, "type": 1, "points": 1, "name_english": 1, "name_punjabi": 1, "class_id": 1})
    return {
        user['user_id']: user
        for user in users
    }

global USERS
USERS = get_users_dict()

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

        # Refresh users and game details
        USERS = get_users_dict()

        if user_id in USERS:
            session['user_id'] = user_id
            session['user_name_english'] = USERS[user_id]['name_english']
            session['user_name_punjabi'] = USERS[user_id]['name_punjabi']
            session['user_class_id'] = USERS[user_id]['class_id']
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
    # Skip if user has no class id
    if not session.get('user_class_id'):
        return render_template(
            'index.html',
            game_details=get_game_details()
        )
    
    # Refresh all users
    USERS = get_users_dict()

    # Generate all-time leaderboard
    alltime_leaderboard = []
    for user_id, user_data in USERS.items():
        if USERS[user_id]["type"] == "student" and USERS[user_id]["points"] > 0 and USERS[user_id]["class_id"] == session.get('user_class_id'):
            alltime_leaderboard.append({
                'id': user_id,
                'points': user_data['points'],
                'name_english': user_data['name_english'],
                'name_punjabi': user_data['name_punjabi']
            })

    alltime_leaderboard.sort(key=lambda x: x['points'], reverse=True)
    alltime_leaderboard = alltime_leaderboard[:5]

    # Generate daily leaderboard
    all_records = db.activity_records.find({"datetime": {"$gte": datetime.now() - timedelta(days=1)}, "class_id": session.get('user_class_id')})
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
            'points': points,
            'name_english': USERS[user_id]['name_english'],
            'name_punjabi': USERS[user_id]['name_punjabi']
        })

    daily_leaderboard.sort(key=lambda x: x['points'], reverse=True)
    daily_leaderboard = daily_leaderboard[:5]

    # Get all game details
    return render_template(
        'index.html',
        alltime_leaderboard=alltime_leaderboard,
        game_details=get_game_details(),
        daily_leaderboard=daily_leaderboard
    )

@app.route('/activities/audio-spelling')
def audio_spelling():
    return render_template('activities/audio_spelling.html')

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

@app.route('/activities/akhar-full-order')
@login_required
def akhar_full_order():
    return render_template('activities/akhar_full_order.html')

@app.route('/activities/vocab-image-matching')
@login_required
def vocab_image_matching():
    return render_template('activities/vocab_image_matching.html')

@app.route('/activities/vocab-audio-matching')
@login_required
def vocab_audio_matching():
    return render_template('activities/vocab_audio_matching.html')

@app.route('/activities/missing-akhar-spelling')
@login_required
def missing_akhar_spelling():
    return render_template('activities/missing_akhar_spelling.html')

@app.route('/activities/batch-tracing')
@login_required
def batch_tracing():
    return render_template('activities/batch_tracing.html')

@app.route('/activities/balloon-akhar-recognition')
@login_required
def balloon_akhar_recognition():
    return render_template('activities/balloon_akhar_recognition.html')

@app.route('/register-user')
@login_required
def register_user():
    # Check if user is admin or teacher
    if session.get('user_type') not in ['admin', 'teacher']:
        flash('Access denied. Only administrators and teachers can register new users.')
        return redirect(url_for('index'))
    
    return render_template('register_user.html')

@app.route('/register-user', methods=['POST'])
@login_required
def register_user_post():
    # Check if user is admin or teacher
    if session.get('user_type') not in ['admin', 'teacher']:
        flash('Access denied. Only administrators and teachers can register new users.')
        return redirect(url_for('index'))
    
    try:
        user_id = request.form.get('user_id').lower()
        name_english = request.form.get('name_english')
        name_punjabi = request.form.get('name_punjabi')
        class_id = request.form.get('class_id')
        user_type = request.form.get('user_type')
        points = int(request.form.get('points', 0))
        
        # Validate input
        if not user_id or not name_english or not name_punjabi or not class_id or not user_type:
            flash('User ID, Name (English), Name (Punjabi), Class ID, and user type are required.')
            return redirect(url_for('register_user'))
        
        if user_type not in ['student', 'teacher', 'admin']:
            flash('Invalid user type. Must be student, teacher, or admin.')
            return redirect(url_for('register_user'))
        
        # Check if user already exists
        existing_user = db.users.find_one({"user_id": user_id})
        if existing_user:
            flash(f'User "{user_id}" already exists.')
            return redirect(url_for('register_user'))
        
        # Create new user
        new_user = {
            "user_id": user_id,
            "name_english": name_english,
            "name_punjabi": name_punjabi,
            "class_id": class_id,
            "type": user_type,
            "points": points
        }
        
        db.users.insert_one(new_user)
        
        flash(f'User "{user_id}" registered successfully as {user_type}.')
        return redirect(url_for('register_user'))
        
    except Exception as e:
        flash(f'Error registering user: {str(e)}')
        return redirect(url_for('register_user'))

@app.route('/games-management')
@login_required
def games_management():
    if session.get('user_type') not in ['admin', 'teacher']:
        flash('Access denied. Only administrators and teachers can manage games.')
        return redirect(url_for('index'))
    
    # Get all games from database
    games = db.games.find({}, {
        "_id": 0,
        "game_id": 1,
        "name_english": 1,
        "name_punjabi": 1,
        "description_english": 1,
        "description_punjabi": 1,
        "color_class": 1,
        "icon": 1,
        "whitelist_class_ids": 1,
        "blacklist_user_ids": 1
    })
    games = [json.loads(json_util.dumps(game)) for game in games]
    
    return render_template('games_management.html', games=games)

@app.route('/games-management/save', methods=['POST'])
@login_required
def save_game_settings():
    if session.get('user_type') not in ['admin', 'teacher']:
        flash('Access denied. Only administrators and teachers can manage games.')
        return redirect(url_for('games_management'))
    
    try:
        game_id = request.form.get('game_id')
        whitelist_class_ids_text = request.form.get('whitelist_class_ids', '').strip()
        blacklist_user_ids_text = request.form.get('blacklist_user_ids', '').strip()
        
        # Parse comma-separated values
        whitelist_class_ids = []
        if whitelist_class_ids_text:
            whitelist_class_ids = [class_id.strip() for class_id in whitelist_class_ids_text.split(',') if class_id.strip()]
        
        blacklist_user_ids = []
        if blacklist_user_ids_text:
            blacklist_user_ids = [user_id.strip() for user_id in blacklist_user_ids_text.split(',') if user_id.strip()]
        
        # Update game settings in database
        db.games.update_one(
            {"game_id": game_id},
            {
                "$set": {
                    "whitelist_class_ids": whitelist_class_ids,
                    "blacklist_user_ids": blacklist_user_ids
                }
            }
        )
        
        flash(f'Game settings for "{game_id}" saved successfully!')
        return redirect(url_for('games_management'))
        
    except Exception as e:
        flash(f'Error saving game settings: {str(e)}')
        return redirect(url_for('games_management'))

@app.route('/class-list/<class_id>')
@login_required
def class_list(class_id):
    # Check if user has access to this class
    user_class_id = session.get('user_class_id')
    user_type = session.get('user_type')
    
    # Only allow access if user is in the same class, or is admin/teacher
    if user_type not in ['admin', 'teacher'] and user_class_id != class_id:
        flash('Access denied. You can only view your own class list.')
        return redirect(url_for('index'))
    
    # Get all users in this class
    class_users = []
    for user_id, user_data in USERS.items():
        if user_data.get('class_id') == class_id:
            # Get activities from the past week
            activities = db.activity_records.find({
                'user_id': user_id,
                'datetime': {'$gte': datetime.now() - timedelta(days=7)}
            })
            
            # Count activities by type
            activity_counts = {}
            for activity in activities:
                activity_type = activity.get('name')
                if activity_type in activity_counts:
                    activity_counts[activity_type] += 1
                else:
                    activity_counts[activity_type] = 1
            
            user_info = {
                'user_id': user_id,
                'type': user_data.get('type', 'student'),
                'name_english': user_data.get('name_english', user_id),
                'name_punjabi': user_data.get('name_punjabi', user_id),
                'points': user_data.get('points', 0),
                'activities': activity_counts
            }
            class_users.append(user_info)
    
    # Sort alphabetically by user_id
    class_users.sort(key=lambda x: x['user_id'])
    
    # Sort by user type first (admin, teacher, student), then by name_english
    type_order = {'admin': 0, 'teacher': 1, 'student': 2}
    class_users.sort(key=lambda x: (type_order.get(x['type'], 3), x['name_english'].lower()))
    
    return render_template('class_list.html', class_id=class_id, users=class_users)

#### API ROUTES ####

@app.route('/register-activity', methods=['POST'])
def register_activity():
    try:
        data = request.get_json()

        # Activity data
        activity_data = {
            "user_id": session.get('user_id', None),
            "class_id": session.get('user_class_id', None),
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
    # Get all user points
    all_user_points = db.activity_records.find({"user_id": user_id}, {"points": 1})
    total_points = sum([
        item['points'] for item in all_user_points
        if item['points'] is not None
    ])

    # Make 0 the lowest possible points
    if total_points < 0:
        total_points = 0

    db.users.update_one({"user_id": user_id}, {"$set": {"points": total_points}})

    # Refresh user points in session
    session['points'] = total_points

    print("Successfully updated user points to ", total_points)

@app.route('/get-vocab')
def get_vocab():
    try:
        # Get topics from request parameters
        topic = request.args.get('topic', '')

        # Get vocab data from database where the topics array contains the topic
        vocab_data = db.vocabulary_terms.find({"topics": topic})
        vocab_data = [json.loads(json_util.dumps(item)) for item in vocab_data]
        print("Found ", len(vocab_data), " vocab items")
        if vocab_data:
            return jsonify({
                "success": True,
                "data": vocab_data
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No vocabulary data found"
            }), 404
        
    except Exception as e:
        print(f"Error fetching vocab: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/get-analytics')
def get_analytics():
    # Get filter data from request
    class_id = request.args.get('class_id', None)
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
    if class_id and class_id.lower() != 'all':
        print("Filtering by class_id: ", class_id)
        data = [item for item in data if item['class_id'] == class_id]
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
        'user_name_english': session.get('user_name_english'),
        'user_name_punjabi': session.get('user_name_punjabi'),
        'user_class_id': session.get('user_class_id'),
        'user_points': session.get('points'),
        'user_type': session.get('user_type')
    }

if __name__ == '__main__':
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', debug=DEBUG)