import requests
import json

key = "Bearer Sfref0PRyV-DtZiPVw471q2Ofvu0feBIRnxQztjoAI7AJpDEKCxEfw"

headers = {
	"Authorization": key
}

body = {
	"query": "",
    "page": 0,
    "page_size": 100
}

people = []

while True:
    print(body["page"])
    request = requests.post("https://api.yalies.io/v2/people", headers=headers, json=body)
    res = request.json()

    if len(res) == 0:
        break

    print(len(res))
    print(res[0])
    print("\n\n")

    people.extend(res)

    body["page"] += 1


print(len(people))

with open("people.json", "w", encoding="utf-8") as f:
    json.dump(people, f, ensure_ascii=False, indent=2)
