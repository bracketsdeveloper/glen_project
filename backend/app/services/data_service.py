import json
import os

# Base directory navigation to reach 'data' outside 'app/' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

EMPLOYEES_FILE = os.path.join(DATA_DIR, 'employees.json')
JOBS_FILE = os.path.join(DATA_DIR, 'jobs.json')
SCHEDULE_FILE = os.path.join(DATA_DIR, 'schedule.json')

def load_json(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)

def get_all_employees():
    return load_json(EMPLOYEES_FILE)

def get_employee_by_id(employee_id):
    employees = get_all_employees()
    return next((e for e in employees if e['id'] == employee_id), None)

def get_all_jobs():
    return load_json(JOBS_FILE)

def get_job_by_id(job_id):
    jobs = get_all_jobs()
    return next((j for j in jobs if j['id'] == job_id), None)

def get_all_schedules():
    return load_json(SCHEDULE_FILE)

def save_schedules(schedule_data):
    save_json(SCHEDULE_FILE, schedule_data)

def save_employees(data):
    save_json(EMPLOYEES_FILE, data)

def save_jobs(data):
    save_json(JOBS_FILE, data)
