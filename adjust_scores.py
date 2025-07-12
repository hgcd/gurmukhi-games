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
        # db.users.update_one(
        #     {"_id": user["_id"]},
        #     {"$set": {"points": recalculated_points}}
        # )

update_user_points()