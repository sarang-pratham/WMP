const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
	id: {
		type: String,
		required: true,
	},
	house_id: {
		type: String,
		required: true,
	},
	collector_id: {
		type: String,
		required: true,
	},
	amount: {
		type: String,
		required: true,
	},
	payment_date: {
		type: String,
		required: true,
	},
});

const Payment = mongoose.model("payment", PaymentSchema);
module.exports = Payment;
