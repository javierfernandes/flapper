var should = require("chai").should();

var router = require("../../../routes/posts.js");
var express = require("express");

var app = express();
app.use("/", router);

var mongoose = require("mongoose");
var mockgoose = require("mockgoose");
var Post = require("../../../models/Posts")

var request = require("supertest");

var dummyMiddleware = function(req, res, next) {
	next();
}

describe("router Posts", function() {

	before(function(done) {
		mockgoose(mongoose).then(function() {
			mongoose.connect("mongodb://localhost/fruta");
			done();
		})
	});

	afterEach(function(done) {
		mockgoose.reset(done);
	});

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

	describe("POST /posts/<id>/upvote", function() {

		it.skip("should increment upvote counter by one", function() {
			request(app)
				.put("/posts/" + post._id + "/upvote")
				.expect(200)
				.end(function(err, response) {
					should.not.exist(err);
					response.body.should.have.property("upvotes").equal(13);
				});
		});

	});

})