from datetime import timedelta
from collections import Counter
from db_connection import MongoDBConnection
from datetime import datetime
# Get the MongoDB database instance
db = MongoDBConnection.get_db()

def get_all_activity_data():
    # Get all activity data from the database
    data = db.activity_records.find({}, {
        "_id": 0,
        "user_id": 1,
        "name": 1,
        "datetime": 1,
        "categories": 1,
        "points": 1,
        "stats": 1,
        "class_id": 1
    })
    return list(data)

def get_usage_stats(data):
    # Get timeline of number of activities each day
    min_datetime = min(item['datetime'] for item in data)
    max_datetime = max(item['datetime'] for item in data)
    all_dates = [min_datetime + timedelta(days=x) for x in range((max_datetime - min_datetime).days + 2)]

    # Get number of activities for each date
    activity_counts = {
        str(date.date()): len([
            item for item in data
            if str(item['datetime'].date()) == str(date.date())
        ])
        for date in all_dates
    }

    # Get usage stats
    usage_stats = {
        'activity_counts': activity_counts
    }

    return usage_stats

def get_activity_stats(data):
    # Generate activity stats
    activity_type_counts = dict(Counter(item['name'] for item in data))
    activity_categories = []
    for item in data:
        activity_categories.extend(item['categories'])
    activity_categories_counts = dict(Counter(activity_categories))
    user_activities_counts = dict(Counter(item['user_id'] for item in data))
    points_stats = Counter()
    for item in data:
        points_stats[item['user_id']] += item['points']
    points_stats = dict(points_stats)

    activity_stats = {
        'activity_type_counts': activity_type_counts,
        'activity_categories_counts': activity_categories_counts,
        'user_activities_counts': user_activities_counts,
        'user_points_stats': points_stats
    }

    return activity_stats

def get_akhar_stats(data):
    all_akhar_correct, all_akhar_mistakes = [], []
    all_akhar_attempt_timeline = []
    for item in data:
        # Skip if the item does not have akhar_correct or akhar_mistakes
        if not ('stats' in item and 'akhar_correct' in item['stats'] and 'akhar_mistakes' in item['stats']):
            continue
        
        all_akhar_correct.extend(item['stats']['akhar_correct'])
        all_akhar_mistakes.extend(item['stats']['akhar_mistakes'])

        # Generate attempt timeline
        all_akhar_attempt_timeline.extend([
            {
                "akhar": akhar,
                "is_correct": True,
                "datetime": item['datetime']
            }
            for akhar in item['stats']['akhar_correct']
        ] + [
            {
                "akhar": akhar,
                "is_correct": False,
                "datetime": item['datetime']
            }
            for akhar in item['stats']['akhar_mistakes']
        ])
    
    akhar_stats = {
        'total_attempts': len(data),
        'total_mistakes': len(all_akhar_mistakes),
        'total_correct': len(all_akhar_correct),
        "all_attempt_timeline": get_attempt_timeline(all_akhar_attempt_timeline, None),
        'akhar_stats': {
            akhar: {
                'total_attempts': all_akhar_correct.count(akhar) + all_akhar_mistakes.count(akhar),
                'total_correct': all_akhar_correct.count(akhar),
                'total_mistakes': all_akhar_mistakes.count(akhar),
                'accuracy': all_akhar_correct.count(akhar) / (all_akhar_correct.count(akhar) + all_akhar_mistakes.count(akhar)),
                "attempt_timeline": get_attempt_timeline(all_akhar_attempt_timeline, akhar)
            }
            for akhar in list(set(all_akhar_correct + all_akhar_mistakes))
            if type(akhar) == str
        }
    }

    return akhar_stats

def get_attempt_timeline(all_akhar_attempt_timeline, akhar):
    akhar_attempt_timeline = [
        {
            "datetime": item['datetime'],
            "is_correct": item['is_correct']
        }
        for item in all_akhar_attempt_timeline
        if (akhar == None or item['akhar'] == akhar)
    ]

    # Get minimum and maximum datetime
    min_datetime = min(item['datetime'] for item in akhar_attempt_timeline)
    max_datetime = max(item['datetime'] for item in akhar_attempt_timeline)

    # Get all dates between min and max datetime
    all_dates = [min_datetime + timedelta(days=x) for x in range((max_datetime - min_datetime).days + 2)]

    # Get all attempts for each date
    all_attempts = [
        {
            "date": str(date.date()),
            "num_correct": len([
                item for item in akhar_attempt_timeline
                if str(item['datetime'].date()) == str(date.date()) and item['is_correct']
            ]),
            "num_mistakes": len([
                item for item in akhar_attempt_timeline
                if str(item['datetime'].date()) == str(date.date()) and not item['is_correct']
            ])
        }
        for date in all_dates
    ]

    return all_attempts