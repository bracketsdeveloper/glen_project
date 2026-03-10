from flask_sqlalchemy import SQLAlchemy

# This db object should ideally be initialized in app.py directly and imported here
db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    availability = db.Column(db.Boolean, default=True)

    # Relationships (Optional based on design)
    # schedules = db.relationship('Schedule', backref='employee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'availability': self.availability
        }
