var app = angular.module('example.posts', ['example.auth', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider.state("home", {
		url: "/home",
		templateUrl: "templates/home.html",
		controller: "MainCtrl",
		resolve: {
			allPostsPromise: ['postService', function(postsService) {
				return postsService.getAll();
			}]
		}
	});

	$stateProvider.state("posts", {
		url: "/posts/{id}",
		templateUrl: "/templates/posts.html",
		controller: "PostsCtrl",
		resolve: {
			postPromise: ['$stateParams', 'postService', function($stateParams, postService) {
				return postService.get($stateParams.id);
			}]
		}
	});
}]);

//Post Service, it holds the data!
app.service('postService', ['$http', 'authService', function($http, authService) {
	this.posts = [];

	this.getAll = function() {
		console.log("getting all");
		return $http.get('/posts').success(function(data) {
			//todo: how to use my own js objects?
			angular.copy(data, this.posts);
		}.bind(this));
	};

	this.create = function(title, link) {
		var post = {
			title: title,
			link: link
		};

		return $http.post('/posts', post, {
			headers: {
				Authorization: 'Bearer ' + authService.getToken()
			}
		}).success(function(data) {
			this.posts.push(data);
		}.bind(this));
	};

	this.comment = function(post, body) {
		var comment = {
			body: body
		}

		return $http.post('/posts/' + post._id + "/comments", comment, {
			headers: {
				Authorization: 'Bearer ' + authService.getToken()
			}
		}).success(function(data) {
			post.comments.push(data);
		});
	}

	this.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	this.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote', {
			headers: {
				Authorization: 'Bearer ' + authService.getToken()
			}
		}).success(function(data) {
			post.upvotes += 1;
		});
	};
}]);

//MainCtrl
app.controller('MainCtrl', ['$scope', 'postService', 'authService', function($scope, postService, authService) {
	$scope.posts = postService.posts;

	$scope.addPost = function() {
		if (!$scope.title || $scope.title === '') {
			return;
		}
		postService.create($scope.title, $scope.link);
		$scope.title = '';
		$scope.link = '';
	}

	$scope.incrementUpvotes = function(post) {
		postService.upvote(post);
	}

	$scope.isLoggedIn = authService.isLoggedIn.bind(authService);
}]);

//PostsCtrl
app.controller('PostsCtrl', ['$scope', 'postService', 'postPromise', 'authService', function($scope, postService, postPromise, authService) {
	$scope.post = postPromise;

	$scope.addComment = function() {
		if ($scope.body === '') {
			return;
		}
		postService.comment($scope.post, $scope.body);
		$scope.body = '';
	};

	$scope.isLoggedIn = authService.isLoggedIn.bind(authService);
}]);