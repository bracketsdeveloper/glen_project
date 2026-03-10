from marshmallow import Schema, fields

class JobSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    startTime = fields.Str(required=True, attribute='start_time')
    endTime = fields.Str(required=True, attribute='end_time')

job_schema = JobSchema()
jobs_schema = JobSchema(many=True)
