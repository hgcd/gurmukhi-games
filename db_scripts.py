import json
from db_connection import MongoDBConnection

# Get the MongoDB database instance
db = MongoDBConnection.get_db()

def update_record_points():
    # Get all records from the activity_records collection
    records = db.activity_records.find({}, {"_id": 1, "user_id": 1, "stats": 1, "points": 1})

    total_updated = 0

    # Iterate through all records
    for record in records:
        # Skip if akhar_correct & akhar_mistakes are not in stats
        if "akhar_correct" not in record["stats"] or "akhar_mistakes" not in record["stats"]:
            continue

        # Get current points
        current_points = record["points"]

        # Get re-calculated points
        recalculated_points = len(record["stats"]["akhar_correct"]) - len(record["stats"]["akhar_mistakes"])

        # If points are different, update the points
        if current_points != recalculated_points:
            # Update the points and set points to old_points
            db.activity_records.update_one(
                {"_id": record["_id"]},
                {"$set": {"points": recalculated_points, "old_points": current_points}}
            )
            print(f"Updated points for {record['user_id']} from {current_points} to {recalculated_points}")
            total_updated += 1

    print("Total records updated: ", total_updated)

def update_user_points():
    # Update all user points to reflect new points
    users = db.users.find({}, {"_id": 1, "user_id": 1, "points": 1})
    for user in users:
        if "points" not in user:
            continue
        recalculated_points = 0
        records = db.activity_records.find({"user_id": user["user_id"]}, {"_id": 1, "points": 1})
        for record in records:
            recalculated_points += record["points"]
        print(f"Updated points for {user['user_id']} from {user['points']} to {recalculated_points}")
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"points": recalculated_points}}
        )

def update_user_records():
    # Add name_english, name_punjabi, class_id field to all user records
    users = db.users.find()
    for user in users:
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"name_english": user["user_id"], "name_punjabi": user["user_id"], "class_id": None}}
        )

def add_game_details():
    GAME_DETAILS = [
        {
            "game_id": "akhar-recognition",
            "name_english": "Akhar Recognition",
            "name_punjabi": "ਅੱਖਰ ਪਛਾਣੋ",
            "description_english": "Practice identifying Gurmukhi letters by sound",
            "description_punjabi": "ਅੱਖਰ ਪਛਾਣੋ ਕਰੋ",
            "color_class": "bg-orange-light",
            "icon": "🎯",
            "skills": ["recognition", "listening"],
            "whitelist_class_ids": ["*"],
            "blacklist_user_ids": []
        }
    ]

    # Create games collection if it doesn't exist
    if "games" not in db.list_collection_names():
        db.create_collection("games")

    # Insert game details
    for game in GAME_DETAILS:
        db.games.insert_one(game)

def set_user_class_id():
    # Set user class id to class id
    users = db.users.find()
    for user in users:
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"class_id": "class-1-fall-2025"}}
        )

def set_activity_class_id():
    # Set activity class id to class id
    activities = db.activity_records.find()
    for activity in activities:
        db.activity_records.update_one(
            {"_id": activity["_id"]},
            {"$set": {"class_id": "class-1-summer-2025"}}
        )

def upload_vocab_terms():
    # TODO - will need a। eperate one just to update for changes
    with open("learn_data/vocabulary_terms_v0.json", "r") as f:
        vocab_terms = json.load(f)
    
    if "vocabulary_terms" not in db.list_collection_names():
        db.create_collection("vocabulary_terms")
    
    db.vocabulary_terms.insert_many(vocab_terms)
    
    print("Vocabulary terms uploaded:", len(vocab_terms))

add_game_details()