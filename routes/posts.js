var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var jwt = require('express-jwt');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

//maps the :post request parameter to something
router.param("post", function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function(err, post) {
    if (err) return next(err);
    if (!post) {
      return next(new Error('can\'t find post'));
    }

    req.post = post;
    return next();
  });
});

//maps the :comment parameter to something 
router.param("comment", function(req, res, next, id) {
  var query = Comment.findById(id);
  //TODO: can i find it in the context of the post already found??
  query.exec(function(err, comment) {
    if (err) return next(err);
    if (!comment) {
      return next(new Error('can\'t find comment'));
    }

    req.comment = comment;
    return next();
  });
});

//Get all posts
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts) {
    if (err) return next(err);
    res.json(posts);
  });
});

//create new posts in mongo
router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;

  post.save(function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//get a single post by id
router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function(err, post) {
    if (err) return next(err);

    res.json(post);
  });
});

//upvotes
router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post) {
    if (err) return next(err);

    res.json(post);
  });
});

//upvoting a comment
router.put('/posts/:post/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment) {
    if (err) return next(err);

    res.json(comment);
  });
});

//posting a comment
router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.author = req.payload.username;
  comment.post = req.post;

  //saves both objects
  comment.save(function(err, comment) {
    if (err) return next(err);

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if (err) return next(err);
      res.json(comment);
    });
  });
});

module.exports = router;