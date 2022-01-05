const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const HouseSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	area: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
});

const House = mongoose.model("house", HouseSchema)
module.exports = House;

