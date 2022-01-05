const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GarbageSchema = new Schema({
	driver_id: {
		type: String,
		required: true,
	},
	degradable: {
		type: String,
		required: true,
	},
	non_degradable: {
		type: String,
		required: true,
	},
	collected_date: {
		type: String,
		required: true,
	},
});

const Garbage = mongoose.model("garbage", GarbageSchema);
module.exports = Garbage;
