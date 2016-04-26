var assert = require("chai").assert;

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
		mockgoose.reset();
	})

	describe("upvote", function() {

		var post;

		beforeEach(function(done) {
			post = new Post();
			post.title = "Dummy post";
			post.upvotes = 12;
			post.save(done);
		});

		it("should increment upvote counter by one and save", function(done) {
			post.upvote(function(err, postSaved) {
				assert.isNull(err);
				assert.equal(postSaved.upvotes, 13);
				done();
			});
		});

	});

});