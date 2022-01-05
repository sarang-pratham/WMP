const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	vehicle_type: {
		type: String,
		required: true,
	},
	capacity: {
		type: String,
		required: true,
	},
});

const Vehicle = mongoose.model("vehicle",VehicleSchema );
module.exports = Vehicle