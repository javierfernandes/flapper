var should = require("chai").should();

describe("login page", function() {

	it("debe mostrar el titulo correcto", function(done) {
		browser.get("http://localhost:3000/#/login");

		browser.getTitle().then(function(valueOfTitle) {
			valueOfTitle.should.be.equal("News!");
			done();
		});
	});

	it("debe loguearse con un usuario valido", function(done) {
		browser.get("http://localhost:3000/#/login");

		element(by.model("user.username")).sendKeys("pipo");
		element(by.model("user.password")).sendKeys("1234");
		element(by.buttonText("Ingresar")).click();

		element(by.binding("currentUser()")).getText().then(function(usuarioLogueado) {
			usuarioLogueado.should.be.equal("pipo");
			done();
		});
	});

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