from .employee_routes import employee_bp
from .job_routes import job_bp
from .schedule_routes import schedule_bp

def register_routes(app):
    app.register_blueprint(employee_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(schedule_bp)
