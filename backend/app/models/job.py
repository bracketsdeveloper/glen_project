from app.models.employee import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    start_time = db.Column(db.String(10), nullable=False) # Store 'HH:MM'
    end_time = db.Column(db.String(10), nullable=False)

    # Relationships
    # schedules = db.relationship('Schedule', backref='job', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'startTime': self.start_time,
            'endTime': self.end_time
        }
