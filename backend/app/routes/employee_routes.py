from flask import Blueprint, request, jsonify
from app.services.data_service import get_all_employees, save_employees
import time

employee_bp = Blueprint('employee_routes', __name__)

@employee_bp.route('/employees', methods=['GET'])
def get_employees():
    return jsonify(get_all_employees())

@employee_bp.route('/employees', methods=['POST'])
def add_employee():
    data = request.json
    name = data.get('name')
    role = data.get('role')
    acc_avail = data.get('availability', True)
    
    if not name or not role:
        return jsonify({"error": "name and role are required"}), 400
        
    emps = get_all_employees()
    new_emp = {
        "id": int(time.time() * 1000),
        "name": name,
        "role": role,
        "availability": acc_avail
    }
    emps.append(new_emp)
    save_employees(emps)
    return jsonify({"message": "Employee added successfully", "employee": new_emp}), 201

from app.services.data_service import get_all_schedules, save_schedules

@employee_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.json
    emps = get_all_employees()
    emp = next((e for e in emps if e['id'] == emp_id), None)
    if not emp:
        return jsonify({"error": "Employee not found"}), 404
        
    if 'name' in data: emp['name'] = data['name']
    if 'role' in data: emp['role'] = data['role']
    if 'availability' in data: emp['availability'] = data['availability']
    
    save_employees(emps)
    return jsonify({"message": "Employee updated", "employee": emp}), 200

@employee_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    emps = get_all_employees()
    new_emps = [e for e in emps if e['id'] != emp_id]
    if len(emps) == len(new_emps):
        return jsonify({"error": "Employee not found"}), 404
    
    save_employees(new_emps)
    
    # Cascade delete schedules
    schedules = get_all_schedules()
    new_schedules = [s for s in schedules if s['employeeId'] != emp_id]
    if len(schedules) != len(new_schedules):
        save_schedules(new_schedules)
        
    return jsonify({"message": "Employee deleted"}), 200
