var car = {
	name : "sonata",
	ph : "500ph",
	start : function () {
		console.log("engine is starting" + ph);
	},
	stop : function () {
		console.log("engine is stoped");
	}
}

console.log(car.name);
car.start();
car.stop();

var car2 = {
	name : "bmw",
	ph : "500ph",
	start : function () {
		console.log("engine is starting");
	},
	stop : function () {
		console.log("engine is stoped");
	}
}
