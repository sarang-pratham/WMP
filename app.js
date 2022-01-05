const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const mongodbSession = require("connect-mongodb-session")(session);
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");

/* --------Models--------*/
const User = require("./models/User");
const House = require("./models/House");
const Employee = require("./models/Employee");
const Payment = require("./models/Payment");
const Driver = require("./models/Driver");
const Vehicle = require("./models/Vehicle");
const Garbage = require("./models/Garbage");

const app = express();

/* --------Database Connection--------*/
const dbURI =
	"mongodb+srv://pratham:testpratham@web-app.u0zbt.mongodb.net/test-db?retryWrites=true&w=majority";

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => app.listen(3000))
	.catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = new mongodbSession({
	uri: dbURI,
	collection: "sessions",
});
app.use(
	session({
		secret: "waste management system",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

const generateID = () => {
	const g_id = nanoid(4);
	let id = "";
	for (let i = 0; i < g_id.length; i++) {
		id += g_id[i].charCodeAt().toString();
	}
	return id;
};

const isAuth = (req, res, next) => {
	if (req.session.isAuth) {
		app.locals.access = req.session.access;
		app.locals.auth = req.session.isAuth;
		next();
	} else {
		res.redirect("/");
	}
};

const createAdmin = async () => {
	const user = await User.findOne({ role: "admin" });
	if (!user) {
		let id = generateID();
		password = "secret";
		const hashPassword = await bcrypt.hash(password, 12);

		try {
			const admin = await User.create({
				id,
				password: hashPassword,
				role: "admin",
			});
		} catch (err) {
			console.log(err);
		}
	}
};
createAdmin();

app.get("/", (req, res) => {
	return res.render("login.ejs");
});

//creating new access
app.get("/users", isAuth, (req, res) => {
	User.find({ role: "emp" }, (err, result) => {
		if (err) {
			console.log(err);
			return;
		}
		res.render("allusers.ejs", { result });
	});
});
app.post("/users", isAuth, async (req, res) => {
	const { id, password } = req.body;
	let user = await User.findOne({ id });
	if (!user) {
		const hashPassword = await bcrypt.hash(password, 12);
		try {
			await User.create({ id, password: hashPassword, role: "emp" });
			return res.redirect("/users");
		} catch (err) {
			cosole.log(err);
		}
	}
});
app.delete("/deleteuser/:id", isAuth, (req, res) => {
	User.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

app.post("/login", async (req, res) => {
	const { id, password } = req.body;

	const user = await User.findOne({ id });
	// console.log(user);
	if (!user) {
		return res.redirect("/");
	}
	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch) {
		return res.redirect("/");
	}

	req.session.isAuth = true;
	req.session.access = { user };
	res.redirect("/index");
});

app.get("/index", isAuth, (req, res) => {
	return res.render("index.ejs");
});

app.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err;
	});
	res.redirect("/");
});

/*--------Employee Details--------*/
app.get("/addEmployee", isAuth, (req, res) => {
	res.render("addEmployee.ejs", { result: "" });
});
app.post("/addEmployee", isAuth, async (req, res) => {
	const { name, address, role, phone } = req.body;
	let id = generateID();

	if (role == "CEO" || role == "ceo") {
		let emp = await Employee.findOne({ role: "CEO" });
		if (emp) return res.render("addEmployee.ejs", { result: "failed" });
	}
	const employeeMatch = await Employee.findOne({ id });

	if (!employeeMatch) {
		try {
			const employee = await Employee.create({
				id,
				name,
				address,
				role,
				phone,
			});
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addEmployee.ejs", { result: "/employees" });
});
app.get("/employees", isAuth, (req, res) => {
	Employee.find({}, function (err, result) {
		if (err) {
			return console.log(errr);
		} else {
			return res.render("viewemployee.ejs", { result });
		}
	});
});

/* --------House Details--------*/
app.get("/addHouse", isAuth, (req, res) => {
	res.render("addHouse.ejs", { result: "" });
});
app.post("/addHouse", isAuth, async (req, res) => {
	const { id, area, phone, address } = req.body;

	const houseMatch = await House.findOne({ id });
	if (!houseMatch) {
		try {
			const house = await House.create({ id, phone, area, address });
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addHouse.ejs", { result: "/houses" });
});
app.get("/houses", (req, res) => {
	House.find({}, function (err, result) {
		if (err) {
			return console.log(errr);
		} else {
			return res.render("viewhouse.ejs", { result });
		}
	});
});

/* --------Payment Details--------*/
app.get("/addPayment", isAuth, (req, res) => {
	House.find({}, (err, house) => {
		if (err) {
			console.log(err);
			return;
		}
		Employee.find({ role: "collector" }, (err, emp) => {
			if (err) {
				console.log(err);
				return;
			}
			res.render("addPayment.ejs", { result: "", house, emp });
		});
	});
});
app.post("/addPayment", isAuth, async (req, res) => {
	const { house_id, collector_id, amount, payment_date } = req.body;
	let id = generateID();

	const paymentMatch = await Payment.findOne({ id });
	const checkHouse = await House.findOne({ id: house_id });
	const checkCollector = await Employee.findOne({ id: collector_id });
	if (!paymentMatch && checkHouse && checkCollector) {
		try {
			const payment = await Payment.create({
				id,
				house_id,
				collector_id,
				amount,
				payment_date,
			});
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addPayment.ejs", { result: "/payments", house: [], emp: [] });
});
app.get("/payments", isAuth, (req, res) => {
	Payment.find({}, function (err, result) {
		if (err) {
			return console.log(err);
		} else {
			return res.render("viewpayment.ejs", { result });
		}
	});
});

/* --------Vehicle Details--------*/
app.get("/addVehicle", isAuth, (req, res) => {
	res.render("addVehicle.ejs", { result: "" });
});
app.post("/addVehicle", isAuth, async (req, res) => {
	const { id, vehicle_type, capacity } = req.body;

	const vehicleMatch = await Vehicle.findOne({ id });
	if (!vehicleMatch) {
		try {
			const vehicle = await Vehicle.create({
				id,
				vehicle_type,
				capacity,
			});
			console.log(vehicle);
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addVehicle.ejs", { result: "/vehicles" });
});
app.get("/vehicles", isAuth, (req, res) => {
	Vehicle.find({}, function (err, result) {
		if (err) {
			return console.log(errr);
		} else {
			return res.render("viewvehicle.ejs", { result });
		}
	});
});

/* --------Driver Details--------*/
app.get("/addDriver", isAuth, (req, res) => {
	Employee.find({ role: "driver" }, (err, driver) => {
		if (err) {
			console.log(err);
			return;
		}
		Employee.find({ role: "authority" }, (err, authority) => {
			if (err) {
				console.log(err);
				return;
			}
			Vehicle.find({}, (err, vehicle) => {
				if (err) {
					console.log(err);
					return;
				}
				res.render("addDriver.ejs", { result: "", driver, authority, vehicle });
			});
		});
	});
});
app.post("/addDriver", isAuth, async (req, res) => {
	const { id, vehicle_id, authority_id, assign_date, location } = req.body;
	const checkDriver = await Employee.findOne({ id, role: "driver" });
	const checkVehicle = await Vehicle.findOne({ id: vehicle_id });
	const checkAuthority = await Employee.findOne({ id: authority_id });

	if (checkDriver && checkVehicle && checkAuthority) {
		try {
			const driver = await Driver.create({
				id,
				vehicle_id,
				authority_id,
				assign_date,
				location,
			});
			console.log(driver);
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addDriver.ejs", {
		result: "/drivers",
		driver: [],
		authority: [],
		vehicle: [],
	});
});
app.get("/drivers", isAuth, (req, res) => {
	Driver.find({}, function (err, result) {
		if (err) {
			return console.log(errr);
		} else {
			return res.render("viewdriver.ejs", { result });
		}
	});
});

/* --------Garbage Details--------*/
app.get("/addGarbage", isAuth, (req, res) => {
	Employee.find({ role: "driver" }, (err, driver) => {
		if (err) {
			console.log(err);
			return;
		}
		res.render("addGarbage.ejs", { result: "", driver });
	});
});
app.post("/addGarbage", isAuth, async (req, res) => {
	const { driver_id, degradable, non_degradable, collected_date } = req.body;

	const checkDriver = await Driver.findOne({ id: driver_id });

	if (checkDriver) {
		try {
			const garbage = await Garbage.create({
				driver_id,
				degradable,
				non_degradable,
				collected_date,
			});
			console.log(garbage);
		} catch (err) {
			console.log(err);
		}
	}
	return res.render("addGarbage.ejs", { result: "/garbage", driver: [] });
});
app.get("/garbage", isAuth, (req, res) => {
	Garbage.find({}, function (err, result) {
		if (err) {
			return console.log(err);
		} else {
			return res.render("viewgarbage.ejs", { result });
		}
	});
});

app.delete("/deletehouse/:id", isAuth, (req, res) => {
	console.log();
	House.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

app.delete("/deletepayment/:id", isAuth, (req, res) => {
	Payment.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

app.delete("/deletevehicle/:id", isAuth, (req, res) => {
	Vehicle.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

app.delete("/deletegarbage/:id", isAuth, (req, res) => {
	Garbage.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

app.delete("/deleteemployee/:id", isAuth, (req, res) => {
	Employee.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});
app.delete("/deletedriver/:id", isAuth, (req, res) => {
	Driver.findOneAndDelete({ id: req.params.id }, function (err) {
		if (err) {
			console.log(err);
			return;
		}
		return res.json({ msg: "success" });
	});
});

//update
app.get("/edithouse/:id", isAuth, (req, res) => {
	House.find({ id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updatehouse.ejs", { result });
	});
});
app.post("/updatehouse/:id", isAuth, async (req, res) => {
	const { id, phone, area, address } = req.body;
	try {
		await House.findOneAndUpdate(
			{ id: req.params.id },
			{ id, phone, area, address },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/houses");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});

app.get("/editemployee/:id", isAuth, (req, res) => {
	Employee.find({ id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updateemployee.ejs", { result });
	});
});
app.post("/updateemployee/:id", isAuth, async (req, res) => {
	const { id, name, phone, role, address } = req.body;
	try {
		await Employee.findOneAndUpdate(
			{ id: req.params.id },
			{ id, name, phone, role, address },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/employees");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});

app.get("/editvehicle/:id", isAuth, (req, res) => {
	Vehicle.find({ id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updatevehicle.ejs", { result });
	});
});
app.post("/updatevehicle/:id", isAuth, async (req, res) => {
	const { id, vehicle_type, capacity } = req.body;
	try {
		await Vehicle.findOneAndUpdate(
			{ id: req.params.id },
			{ id, vehicle_type, capacity },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/vehicles");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});

app.get("/editdriver/:id", isAuth, (req, res) => {
	Driver.find({ _id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updatedriver.ejs", { result });
	});
});
app.post("/updatedriver/:id", isAuth, async (req, res) => {
	const { id, vehicle_id, authority_id, assign_date, location } = req.body;
	try {
		await Driver.findOneAndUpdate(
			{ _id: req.params.id },
			{ id, vehicle_id, authority_id, assign_date, location },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/drivers");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});

app.get("/editpayment/:id", isAuth, (req, res) => {
	Payment.find({ id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updatepayment.ejs", { result });
	});
});
app.post("/updatepayment/:id", isAuth, async (req, res) => {
	const { id, house_id, collector_id, amount, payment_date } = req.body;
	try {
		await Payment.findOneAndUpdate(
			{ id: req.params.id },
			{ id, house_id, collector_id, amount, payment_date },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/payments");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});

app.get("/editgarbage/:id", isAuth, (req, res) => {
	Garbage.find({ _id: req.params.id }, function (err, result) {
		if (err) {
			console.log(err);
			return;
		}
		res.render("updategarbage.ejs", { result });
	});
});
app.post("/updategarbage/:id", isAuth, async (req, res) => {
	const { driver_id, degradable, non_degradable, collected_date } = req.body;
	try {
		await Garbage.findOneAndUpdate(
			{ _id: req.params.id },
			{ driver_id, degradable, non_degradable, collected_date },
			(err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.redirect("/garbage");
			}
		).clone();
	} catch (error) {
		console.error(error);
	}
});
