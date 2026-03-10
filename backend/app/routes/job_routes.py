from flask import Blueprint, request, jsonify
from app.services.data_service import get_all_jobs, save_jobs
import time

job_bp = Blueprint('job_routes', __name__)

@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    return jsonify(get_all_jobs())

@job_bp.route('/jobs', methods=['POST'])
def add_job():
    data = request.json
    name = data.get('name')
    start_time = data.get('startTime')
    end_time = data.get('endTime')
    
    if not name or not start_time or not end_time:
        return jsonify({"error": "name, startTime, and endTime are required"}), 400
        
    jobs = get_all_jobs()
    new_job = {
        "id": int(time.time() * 1000),
        "name": name,
        "startTime": start_time,
        "endTime": end_time
    }
    jobs.append(new_job)
    save_jobs(jobs)
    return jsonify({"message": "Job added successfully", "job": new_job}), 201

from app.services.data_service import get_all_schedules, save_schedules

@job_bp.route('/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.json
    jobs = get_all_jobs()
    job = next((j for j in jobs if j['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Job not found"}), 404
        
    if 'name' in data: job['name'] = data['name']
    if 'startTime' in data: job['startTime'] = data['startTime']
    if 'endTime' in data: job['endTime'] = data['endTime']
    
    save_jobs(jobs)
    return jsonify({"message": "Job updated", "job": job}), 200

@job_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    jobs = get_all_jobs()
    new_jobs = [j for j in jobs if j['id'] != job_id]
    if len(jobs) == len(new_jobs):
        return jsonify({"error": "Job not found"}), 404
    
    save_jobs(new_jobs)
    
    # Cascade delete schedules
    schedules = get_all_schedules()
    new_schedules = [s for s in schedules if s['jobId'] != job_id]
    if len(schedules) != len(new_schedules):
        save_schedules(new_schedules)
        
    return jsonify({"message": "Job deleted"}), 200
