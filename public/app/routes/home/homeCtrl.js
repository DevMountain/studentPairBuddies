// INITILIZE CONTROLLER
// ============================================================
angular.module("app").controller("homeCtrl", function($scope, $state, loginService) {

  // VARIABLES
  // ============================================================
  

  // FUNCTIONS
  // ============================================================
  $scope.login = function(user){
    loginService.login(user).then(function(response){
      console.log(response)
      if(!response.data.username){
        alert('User does not exist')
        $scope.user.password = ''
      } else {
        $state.go('cohorts')
      }
    })
    .catch(function(err){
      alert('Unable to login')
    })
  }

  $scope.register = function(user){
    loginService.registerUser(user).then(function(response){
      if(!response.data){
        alert('Unable to create user')
      } else {
        console.log(response)
        alert('User Created')
        $scope.newUser = {}
      }
    })
    .catch(function(err){
      alert('Unable to create user')
    })
  }

});
