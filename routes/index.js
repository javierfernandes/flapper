var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var passport = require("passport");
var jwt = require('express-jwt');
var ejs = require('ejs');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sender('index.html');
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
  console.log(req.body);

  post.save(function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//maps the :post request parameter to something
router.param("post", auth, function(req, res, next, id) {
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
router.param("comment", auth, function(req, res, next, id) {
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

//posting a comment
router.put('/posts/:post/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment) {
    if (err) return next(err);

    res.json(comment);
  });
});

//clean up stuff
router.delete('/posts', auth, function(req, res, next) {
  Post.remove({}, function(err) {
    if (err) return next(err);

    Comment.remove({}, function(err) {
      if (err) return next(err);
      res.json({});
    });
  });
});

//posting a comment
router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
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

router.post('/register', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Please fill out all fields'
    });
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)

  user.save(function(err) {
    if (err) return next(err);

    return res.json({
      token: user.generateToken()
    })
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err) return next(err); 

    if(user){
      return res.json({token: user.generateToken()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;