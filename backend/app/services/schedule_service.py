from datetime import datetime, timezone
from .data_service import (
    get_all_schedules, save_schedules,
    get_employee_by_id, get_job_by_id
)

def time_to_val(t_str):
    return datetime.strptime(t_str, '%H:%M').time()

def is_overlap(start1, end1, start2, end2):
    t1_s = time_to_val(start1)
    t1_e = time_to_val(end1)
    t2_s = time_to_val(start2)
    t2_e = time_to_val(end2)
    return t1_s < t2_e and t1_e > t2_s

def assign_job(employee_id, job_id, date_str):
    employee = get_employee_by_id(employee_id)
    job = get_job_by_id(job_id)

    if not employee:
        return False, "Employee not found"
    if not job:
        return False, "Job not found"

    # Rule 3: Availability Filtering
    if not employee.get('availability', False):
        return False, "Employee is marked as unavailable"

    schedule = get_all_schedules()
    job_start = job['startTime']
    job_end = job['endTime']

    # Rule 1 & 2: No Double Booking & No Overlapping
    for assign in schedule:
        # Only check overlapping conflicts if assignments are taking place on the same date!
        if assign['employeeId'] == employee_id and assign.get('date') == date_str:
            assigned_job = get_job_by_id(assign['jobId'])
            if assigned_job:
                if assigned_job['id'] == job_id:
                    return False, "Employee is already assigned to this job on this date"

                if is_overlap(job_start, job_end, assigned_job['startTime'], assigned_job['endTime']):
                    return False, f"Time window overlaps with already assigned job: {assigned_job['name']}"

    # Use UTC timestamp to prevent issues
    new_assignment = {
        "id": int(datetime.now(timezone.utc).timestamp() * 1000), 
        "employeeId": employee_id,
        "jobId": job_id,
        "date": date_str
    }
    schedule.append(new_assignment)
    save_schedules(schedule)
    return True, new_assignment

def remove_assignment(assignment_id):
    schedule = get_all_schedules()
    new_schedule = [a for a in schedule if a['id'] != assignment_id]
    if len(schedule) == len(new_schedule):
        return False, "Assignment not found"

    save_schedules(new_schedule)
    return True, "Assignment removed successfully"
