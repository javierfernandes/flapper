var expect = require("chai").expect;
var should = require("chai").should();

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");
var Post = require("../../../models/Posts")

describe("model Post", function() {

	before(function(done) {
		mockgoose(mongoose).then(function() {
			mongoose.connect("mongodb://localhost/fruta");
			done();
		})
	});

	afterEach(function(done) {
		mockgoose.reset(done);
	})

	after(function(done) {
		mongoose.disconnect(done);
	});

	var post;

	beforeEach(function(done) {
		post = new Post();
		post.title = "Dummy post";
		post.author = "Yo";
		post.upvotes = 12;
		post.save(done);
	});

	describe("upvote", function() {

		it("should increment upvote counter by one and save", function(done) {
			post.upvote(function(err, postSaved) {
				should.not.exist(err);
				//expect(err).is.null;
				//assert.isNull(err);
				
				postSaved.upvotes.should.be.equal(13);
				//expect(postSaved.upvotes).to.be.equal(13);
				//assert.equal(postSaved.upvotes, 13);
				
				postSaved.should.have.property("title").that.equal("Dummy post");

				done();
			});
		});

	});

	describe("getDescription", function() {

		it("should return title and author together", function() {
			var description = post.getDescription();
			description.should.be.equal("Dummy post by Yo")
			//expect(description).to.be.equal("Dummy post by Yo")
			//assert.equal("Dummy post by Yo", description);
		});

	});

});