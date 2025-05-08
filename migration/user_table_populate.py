# Important note: this migration script assumes EVERY SINGLE event has 
# a participants subcollection; if this is not the case, it will yield an assertion error

import os
from pathlib import Path
from dotenv import load_dotenv

from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

# |---------- load secrets ----------|

# / operator is overloaded on path instances --> / joins paths
env_path = Path(__file__).resolve().parent.parent / ".secrets/.env"
load_dotenv(dotenv_path=env_path)

key_path = env_path = Path(__file__).resolve().parent.parent / ".secrets/service_account_key.json"
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)

# |---------- declare constants, init db ----------|

API_KEY = os.getenv("FIREBASE_API_KEY", "BAD_API_KEY") 
PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "BAD_PROJECT_ID")
MAX_N_EVENTS = 50

db = firestore.client()

# |---------- main task loop ----------|

# fetch documents from the events collection
for event_doc in db.collection("events").limit(MAX_N_EVENTS).stream():
    
    event_data = event_doc.to_dict()
    # extract fields 
    event_id = event_data.get("publicId")
    admin_id = event_data.get("adminAccountId")
    participants = event_data.get("participants", [])

    # fetch participants subcollection 
    # [this must exist for every event for the script to run properly]   
    participants_sub = db.collection("events").document(event_id).collection("participants").stream()

    # init name, email mappings for participants
    id_to_email_map = {}
    id_to_name_map = {}

    # go over all docs  
    for participant_doc in participants_sub:

        participant_data = participant_doc.to_dict()
        # extract fields
        account_id = participant_data.get("accountId", "")
        email = participant_data.get("email", "")
        name = participant_data.get("name", "")

        if account_id and email:
            id_to_email_map[account_id] = email

        if account_id and name:
            id_to_name_map[account_id] = name

    # for every participant in a given event
    for participant_id in participants:
        
        # try to fetch user
        user_ref = db.collection("users").document(participant_id)
        user_doc = user_ref.get()
        user_data = None

        # if user exists
        if user_doc.exists:
            user_data = user_doc.to_dict()
        # if user doesn't exist
        else:
            
            # check we have email
            user_email = id_to_email_map.get(participant_id, "")
            # can replace with continue to skip bad participant_ids
            # assert(user_email != "")
            if user_email == "":
                continue 
            
            # check we have name
            user_name = id_to_name_map.get(participant_id, "")
            # can replace with continue to skip bad participant_ids
            # assert(user_name != "")
            if user_name == "":
                continue

            # construct user
            user_data = {
                "email": user_email,
                "name": user_name,
                "selectedCalendarIDs": [user_email],
                "uid": participant_id,
                "userEvents": []
            }
        
        is_admin = (participant_id == admin_id)

        # make sure user has userEvents attr
        if "userEvents" not in user_data:
            user_data["userEvents"] = []
        
        # avoid event duplicates
        if not any(event_already_on_user["code"] == event_id for event_already_on_user in user_data["userEvents"]):
        
            # construct event
            event_entry = {
                "code": event_id,
                "idAdmin": is_admin,
                "dateCreated": datetime.now(),
                "lastModified": datetime.now()
            }
            user_data["userEvents"].append(event_entry)

        # danger! this will override existing user data, 
        # use merge=True option for soft merge
        user_ref.set(user_data)


# skip if no participant subc
# if code not 6 digits
# if Date is not DateTime