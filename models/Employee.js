const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
	},
});

const Employee = mongoose.model("employee", EmployeeSchema);
module.exports = Employee;
