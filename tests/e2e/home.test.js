var should = require("chai").should();

describe("home", function() {

	context("cuando no hay un usuario logueado", function() {
		it("tiene que tener un encabezado", function(done) {
			browser.get("http://localhost:3000/#/home");

			element(by.css(".page-header h1")).getText().then(function(value) {
				value.should.be.equal("UNQ Noticias");
				done();
			})
		});

		it("tiene que existir un link a Ingresar", function(done) {
			browser.get("http://localhost:3000/#/home");

			element(by.linkText("Ingresar")).isPresent().then(function(value) {
				value.should.be.true;
				done();
			});
		});
	})

	function logueate() {
		browser.get("http://localhost:3000/#/login");
		element(by.model("user.username")).sendKeys("pipo");
		element(by.model("user.password")).sendKeys("1234");
		element(by.buttonText("Ingresar")).click();
	}

	context("cuando si hay un usuario logueado", function() {
		beforeEach(function() {
			logueate();
		});

		it("tiene que tener un encabezado", function(done) {
			browser.get("http://localhost:3000/#/home");

			element(by.css(".page-header h1")).getText().then(function(value) {
				value.should.be.equal("UNQ Noticias");
				done();
			})
		});

		it("no tiene que existir un link a Ingresar", function(done) {
			browser.get("http://localhost:3000/#/home");

			element(by.linkText("Ingresar")).isPresent().then(function(value) {
				value.should.be.false;
				done();
			});
		});
	})

	afterEach(function(done) {
		var botonSalir = element(by.linkText("Salir"));
		element(by.linkText("Salir")).isPresent().then(function(value) {
			if (value) {
				//rowser.pause();
				botonSalir.click().then(done);
			} else {
				done();
			}
		});
	});

});