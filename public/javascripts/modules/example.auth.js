var app = angular.module('example.auth', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
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

    $httpProvider.interceptors.push('authHttpRequestInterceptor');
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

//no puedo inyectar authService porque necesito que la dependencia sea
//resuelta de forma lazy, caso contrario se crea una dependencia circular
//entre los componentes: 
//     $http -> authHttpRequestInterceptor -> authService -> $http
//
//La forma correcta quizas seria refactorizar el authService en dos
//servicios diferentes
app.service('authHttpRequestInterceptor', ['$injector', function($injector) {
    this.request = function(config) {
        var authService = $injector.get('authService');
        if (authService.isLoggedIn()) {
            config.headers.Authorization = 'Bearer ' + authService.getToken();
        }
        return config;
    }
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