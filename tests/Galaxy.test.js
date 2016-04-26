describe('La galaxia', function () {

	before(function() {
		console.log("before en galaxia");
	});

	describe('La tierra', function () {

		before(function() {
			console.log("before en la tierra");
		});

		beforeEach(function() {
			console.log("before each en la tierra");
		})

		context("en presencia del Sol", function() {
			it("debe ser redonda", function() {
			//Codigo
			//throw new Error("no es redonda");
			});

			it("debe girar alrededor del sol", function() {
				//throw new Error("eppur si mouve");
			});
		})

		context("en el apocalipsis", function() {
			it("estamos en el horno");
		});
		
		
	});

	describe('La luna', function () {

		it("debe ser redonda", function() {
			//Codigo
			//throw new Error("no es redonda");
		});

		it("debe girar alrededor de la tierra", function() {

		});
		
	});
});

