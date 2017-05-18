// INITILIZE SERVICE
// ============================================================
angular.module("app")
	.service("loginService", function($http) {

		// PROCESSES
		// ============================================================

	  // CRUD FUNCTIONS
	  // ============================================================
    this.login = function(user){
      return $http.post('/api/login', user)
			.then(function(response){
				return response;
			})
    }

		this.logout = function(){
			return $http.get('/api/logout')
			.then(function(response){
				return response;
			})
		}

		this.getCurrentUser = function(){
			return $http.get('/api/me')
			.then(function(response){
				return response;
			})
		}

		this.registerUser = function(user){
			return $http.post('/api/register', user)
			.then(function(response){
				return response;
			})
		}

	});