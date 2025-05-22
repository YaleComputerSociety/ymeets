# |---------- usage ----------|
#
# Migration Script to sync "events" --> "users" in Firestore.
#
# Prerequisites:
#   1. Obtain a service account key JSON from your Firebase project:
#        Firestore console --> Settings --> Service accounts --> Generate new private key.
#   2. Place that JSON at `.secrets/service_account_key.json` (or adjust the path below).
#   3. Install dependencies:
#        pip install firebase-admin
#   4. Modify script settings to adjust behaviour:
#        `ONLY_6_DIGIT_EVENT_CODE = True` will skip events
#        if their code is not 6 digits long
#        `EVENT_DATE_MIST_BE_DATETIME = True` will skip events
#        if their dates are not datetime objects



# |---------- imports ----------|

from sys import exit
from pathlib import Path
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

# inclusion guard
if __name__ == "__main__":
    print("START: Begin running the migration script")

    # |---------- script settings ----------|

    ONLY_6_DIGIT_EVENT_CODE = True
    EVENT_DATE_MUST_BE_DATETIME = True

    # |---------- Firebase SDK setup ----------|

    try:
        print("LOG: Fetching the firebase account key")
        key_path = Path(__file__).resolve().parent.parent / ".secrets/service_account_key.json"
        print("LOG: Initializing the firebase SDK")
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"ERROR: {e}")
        exit("STOP: Terminating script")

    # |---------- declare constants, init db ----------|

    PAGE_SIZE = 256
    db = firestore.client()

    # |---------- main loop ----------|

    last_event_doc = None
    count = 0

    while True:

        query = db.collection("events").order_by("publicId").limit(PAGE_SIZE)

        if last_event_doc:
            query = query.start_after(last_event_doc)

        event_docs = query.stream()
        event_docs = list(event_docs)

        if not event_docs:
            print("SUCCESS: All documents processed")
            break

        print("LOG: Fetching page #{count}")

        first_event_id = event_docs[0].get("publicId", "")

        if first_event_id:
            print(f"LOG: Processing events after {first_event_id}")
        else:
            print("ERROR: Cannot access documents in the current page")
            exit("STOP: Terminating script")

        # for every document in the events collection
        for event_doc in event_docs:
            
            event_data = event_doc.to_dict()
            event_id = event_data.get("publicId")
            admin_id = event_data.get("adminAccountId")
            participant_ids = event_data.get("participants", [])
            dates = event_data.get("dates")

            # check that dates are correct format
            dates_are_datetimes = True
            for date in dates.values():
                if not isinstance(date, datetime):
                    dates_are_datetimes = False
                    break

            if not dates_are_datetimes and EVENT_DATE_MUST_BE_DATETIME:
                continue

            # check that code is 6 chars long
            if len(event_id) != 6 and ONLY_6_DIGIT_EVENT_CODE:
                continue

            # fetch participants subcollection of a given event
            participant_docs = db.collection("events").document(event_id).collection("participants").stream()
            participant_docs = list(participant_docs)
            # check that participants exist
            if not participant_docs:
                continue

            # init name, email mappings for participants
            id_to_email_map = {}
            id_to_name_map = {}

            # for every participant in the participants subcollection
            for participant_doc in participant_docs:

                participant_data = participant_doc.to_dict()
                account_id = participant_data.get("accountId", "")
                email = participant_data.get("email", "")
                name = participant_data.get("name", "")

                if account_id and email:
                    id_to_email_map[account_id] = email

                if account_id and name:
                    id_to_name_map[account_id] = name

            # for every participant in a given event
            for participant_id in participant_ids:
                
                # try to fetch user
                user_ref = db.collection("users").document(participant_id)
                user_doc = user_ref.get()
                user_data = None

                # if user exists
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                # if user doesn't exist
                else:
                    
                    # get name and email
                    user_email = id_to_email_map.get(participant_id, "")
                    user_name = id_to_name_map.get(participant_id, "")

                    # check name and email exist
                    if not user_email or not user_name:
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
        
        last_event_doc = event_docs[-1]
