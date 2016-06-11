var app = angular.module('example', ['example.posts', 'example.auth', 'ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('home');
}]);

//NavController
app.controller('NavCtrl', ['$scope', 'authService', function($scope, authService) {
	$scope.isLoggedIn = authService.isLoggedIn.bind(authService);
	$scope.currentUser = authService.currentUser.bind(authService);
	$scope.logOut = authService.logOut.bind(authService);
}]);