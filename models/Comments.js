var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: { type: Number, default: 0 },
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post'
	}
});

CommentSchema.methods.upvote = function(callback) {
	this.upvotes++;
	this.save(callback);
};

CommentSchema.methods.downtovte = function(callback) {
	this.upvotes--;
	this.save(callback);
};

mongoose.model('Comment', CommentSchema);