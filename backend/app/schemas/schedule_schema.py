from marshmallow import Schema, fields

class ScheduleSchema(Schema):
    id = fields.Int(dump_only=True)
    employeeId = fields.Int(required=True, attribute='employee_id')
    jobId = fields.Int(required=True, attribute='job_id')

schedule_schema = ScheduleSchema()
schedules_schema = ScheduleSchema(many=True)
