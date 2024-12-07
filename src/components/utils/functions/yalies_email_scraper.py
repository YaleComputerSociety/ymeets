import yalies
import csv

def main():
    # Ask Nick for API key
    api = yalies.API('Replace with API key')

    all_students = api.people()
    print(f"Total Yale students: {len(all_students)}")

     # Filter students with non-empty name and email
    students_with_email = [
        {'name': f"{student.first_name} {student.last_name}", 'email': student.email}
        for student in all_students
        if student.first_name and student.last_name and student.email
    ]

    # Write to CSV
    with open('yale_emails_ymeets_11_14_2024.csv', mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['name', 'email'])
        writer.writeheader()
        writer.writerows(students_with_email)

    print(f"CSV file created with {len(students_with_email)} entries.")

if __name__ == "__main__":
    main()