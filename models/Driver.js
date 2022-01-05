const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DriverSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	vehicle_id: {
		type: String,
		required: true,
	},
	authority_id: {
		type: String,
		required: true,
	},
	assign_date: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
});

const Driver = mongoose.model("driver",DriverSchema)
module.exports = Driver