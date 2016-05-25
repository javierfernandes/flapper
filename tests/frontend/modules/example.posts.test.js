describe("module example.posts", function() {

	describe("postService", function() {

		beforeEach(module("example.posts"));

		var postService;
		var $httpBackend;

		beforeEach(inject(function(_postService_, _$httpBackend_) {
			postService = _postService_;	
			$httpBackend = _$httpBackend_;
		}));
		

		describe("#upvote()", function() {

			it("should call backend with post id", function(done) {
				var post = {
					_id: "12345678",
					upvotes: 12
				};

				//upvote devuelve una promise que no se va a resolver hasta el backend
				//no conteste. El backend va a contestar una vez que invoquemos a 
				//$httpBackend.flush();
				var promise = postService.upvote(post)
				promise.then(function() {
					post.should.have.property("upvotes").equal(13);
					done();
				});

				var respuesta = {
					_id: "12345678",
					upvotes: 13
				};

				$httpBackend.expectPUT("/posts/12345678/upvote").respond(respuesta);
				$httpBackend.flush();
			});

			it("should update give post upvotes count to what was returned by server", function(done) {
				var post = {
					_id: "12345678",
					upvotes: 12
				};

				//upote devuelve una promise que no se va a resolver hasta el backend
				//no conteste. El backend va a contestar una vez que invoquemos a 
				//$httpBackend.flush();
				postService.upvote(post).then(function() {
					post.upvotes.should.equal(213);
					done();
				})

				$httpBackend.expectPUT("/posts/12345678/upvote").respond({
					_id: "12345678",
					upvotes: 213 //updated value
				});
				$httpBackend.flush();				
				
			});

		});

	});

});