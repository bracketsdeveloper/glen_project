from app.models.employee import db

class Schedule(db.Model):
    __tablename__ = 'schedules'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'employeeId': self.employee_id,
            'jobId': self.job_id
        }
