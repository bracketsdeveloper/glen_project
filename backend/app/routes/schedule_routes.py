from datetime import datetime
from flask import Blueprint, request, jsonify
from app.services.data_service import get_all_schedules
from app.services.schedule_service import assign_job, remove_assignment

schedule_bp = Blueprint('schedule_routes', __name__)

@schedule_bp.route('/schedule', methods=['GET'])
def get_schedule():
    all_schedules = get_all_schedules()
    filter_date = request.args.get('date')
    if filter_date:
        filtered = [s for s in all_schedules if s.get('date') == filter_date]
        return jsonify(filtered)
    return jsonify(all_schedules)

@schedule_bp.route('/assign', methods=['POST'])
def assign():
    data = request.json
    employee_ids = data.get('employeeIds')
    job_id = data.get('jobId')
    assign_date = data.get('date')
    
    if not assign_date:
        return jsonify({"error": "assignment date is required"}), 400
        
    today_str = datetime.now().strftime('%Y-%m-%d')
    if assign_date < today_str:
        return jsonify({"error": "Cannot create assignments for past dates"}), 400
    
    if not employee_ids and 'employeeId' in data:
        employee_ids = [data.get('employeeId')]
        
    if not employee_ids or not job_id:
        return jsonify({"error": "employeeIds and jobId are required"}), 400
        
    if not isinstance(employee_ids, list):
        employee_ids = [employee_ids]
        
    try:
        employee_ids = [int(eid) for eid in employee_ids]
        job_id = int(job_id)
    except ValueError:
        return jsonify({"error": "Invalid ID formats"}), 400

    results = []
    
    for emp_id in employee_ids:
        success, result = assign_job(emp_id, job_id, assign_date)
        if not success:
            # Reverting previous ones isn't handled strictly but acceptable for mini project
            return jsonify({"error": result}), 400
        results.append(result)
    
    return jsonify({"message": "Assigned successfully", "assignments": results}), 201

@schedule_bp.route('/assign/<int:assignment_id>', methods=['DELETE'])
def remove(assignment_id):
    success, message = remove_assignment(assignment_id)
    if not success:
        return jsonify({"error": message}), 404
    return jsonify({"message": message}), 200
