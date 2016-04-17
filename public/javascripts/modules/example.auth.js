var app = angular.module('example.auth', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('login', {
		url: '/login',
		templateUrl: '/templates/login.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'authService', function($state, authService) {
			if (authService.isLoggedIn()) {
				$state.go('home');
			}
		}]
	});

	$stateProvider.state('register', {
		url: '/register',
		templateUrl: '/templates/register.html',
		controller: 'AuthCtrl',
		onEnter: ['$state', 'authService', function($state, authService) {
			if (authService.isLoggedIn()) {
				$state.go('home');
			}
		}]
	});
}]);

//Authentication service
app.service('authService', ['$http', '$window', function($http, $window) {
	this.saveToken = function(token) {
		$window.localStorage['flapper-news-token'] = token;
	};

	this.getToken = function() {
		return $window.localStorage['flapper-news-token'];
	}

	this.isLoggedIn = function() {
		var token = this.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	this.currentUser = function() {
		if (this.isLoggedIn()) {
			var token = this.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	this.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			this.saveToken(data.token);
		}.bind(this));
	};

	this.logIn = function(user) {
		return $http.post('/login', user).success(function(data) {
			this.saveToken(data.token)
		}.bind(this));
	};

	this.logOut = function() {
		$window.localStorage.removeItem('flapper-news-token');
	};
}]);

//Authentication controller for register and login views
app.controller('AuthCtrl', ['$scope', '$state', 'authService', function($scope, $state, authService) {
	$scope.user = {};

	$scope.register = function() {
		authService.register($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};

	$scope.logIn = function() {
		authService.logIn($scope.user).error(function(error) {
			$scope.error = error;
		}).then(function() {
			$state.go('home');
		});
	};
}]);