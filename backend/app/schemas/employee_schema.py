# If employing Marshmallow in future, make sure to standardise with `from flask_marshmallow import Marshmallow`
from marshmallow import Schema, fields

class EmployeeSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    role = fields.Str(required=True)
    availability = fields.Bool(missing=True)

employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)
