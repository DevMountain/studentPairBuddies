// INITILIZE CONTROLLER
// ==========================================================
angular.module("app")
  .controller("studentsCtrl", function($scope, pairs, cohortService, userService, $state) {

  	// VARIABLES
  	// ============================================================
  	$scope.cohort = pairs.data;
    $scope.pairs = $scope.cohort.pairs || [];
    $scope.users = [];
    $scope.expand = false;

  	// FUNCTIONS
  	// ============================================================
  	$scope.getUsers = function() {
  		userService.getUsers($state.params.cohort_id)
  			.then(function(response) {
  				$scope.users = response.data;
  			})
        .catch(function(err) {
          console.log(err);
        });
  	};
    $scope.getUsers();

    $scope.getPairs = function() {
      cohortService.getPairs($scope.cohort._id)
        .then(function(response) {
          $scope.pairs = response.data.pairs;
        });
    };

  	$scope.addUser = function(name) {
  		userService.createUser({name: name, cohort: $state.params.cohort_id})
  			.then(function(response) {
  				$scope.getUsers();
  				$scope.newUser = "";

          if ($scope.pairs.length)
            $scope.pair();
  			})
        .catch(function(err) {
  			  console.log(err);
  			});
  	};

    $scope.updateUser = function(user, name, pair) {
      if (!confirm('Are you sure you want to update this student?')) {
        user.editStudent = false;
        return;
      }

      delete user.slashed;
      delete user.editStudent;
      user.name = name;
      user.pair = pair;

      userService.editUser(user._id, user)
        .then(function(response) {
          $scope.getUsers();
          if (!user.pair) {
            $scope.pair();
          } else {
            $scope.getPairs();
          }
        });
    };

    $scope.deleteUser = function(id) {
      if (!confirm('Are you sure you want to delete this student?')) return;

      userService.deleteUser(id)
        .then(function(response) {
          $scope.getUsers();
          $scope.pair();
        });
    };

  	$scope.pair = function() {
  		cohortService.setPairs($scope.cohort._id)
  			.then(function(response) {
          $scope.getPairs();
  			})
        .catch(function(err) {
          console.log(err);
        });
  	};

    $scope.randomize = function() {
      $scope.users.forEach(function(user) {
        user.slashed = false;
      });

      $scope.users = userService.randomize($scope.users);
      $scope.randomized = true;
    };

    $scope.expandPairs = function() {
      $scope.expand = !$scope.expand;
    };

    $scope.resetStudents = function() {
      $scope.randomized = false;
      $scope.getUsers();
    };

    $scope.editStudentOpen = function(student) {
      for (var i = 0; i < $scope.users.length; i++) {
        $scope.users[i].editStudent = false;

        if ($scope.users[i]._id === student._id) {
          $scope.users[i].editStudent = true;
        }
      }
    };
  })

  .directive('focusOn',function($timeout) {
    return {
        restrict : 'A',
        link : function($scope,$element,$attr) {
            $scope.$watch($attr.focusOn,function(_focusVal) {
                $timeout(function() {
                    _focusVal ? $element[0].focus() :
                        $element[0].blur();
                });
            });
        }
    }
  });
