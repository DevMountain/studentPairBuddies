// INITILIZE CONTROLLER
// ============================================================
angular.module("app").controller("cohortsCtrl", function($scope, $state, cohorts, cohortService, loginService) {

  // VARIABLES
  // ============================================================
  $scope.cohorts = cohorts.data || [];

  // FUNCTIONS
  // ============================================================
  $scope.getCohorts = function() {
    cohortService.getCohorts()
      .then(function(response) {
        $scope.cohorts = response.data;
      });
  };

  $scope.addCohort = function(newCohort) {
    cohortService.createCohort(newCohort)
      .then(function(response) {
        $scope.newCohort = {
          title: '',
          slack_channel: ''
        };
        $scope.getCohorts();
      });
  };

  $scope.updateCohort = function(id, cohort) {
    console.log(cohort + " ID SHOULD BE HERE")
    cohortService.editCohort(id, cohort)
      .then(function(response) {
        $scope.getCohorts();
      });
  };

  $scope.deleteCohort = function(id) {
    cohortService.deleteCohort(id)
      .then(function(response) {
        $scope.getCohorts();
      });
  };

  $scope.logout = function(){
    loginService.logout()
    .then(function(response){
      $state.go('home')
    })
  }

  $scope.toggle = true;

  $scope.openModal = function(){
     $scope.toggle = false;
  }
  $scope.closeModal = function(){
    $scope.toggle = true;
  };

  $scope.switch = true;

  $scope.openUpdateModal = function(cohort){
     $scope.specCohort = cohort;
     $scope.switch = false;
  }
  $scope.closeUpdateModal = function(){
    $scope.switch = true;
  };

  $scope.updateSlackNotifications = function(id, value){
    cohortService.updateSlackNotifications(id, value);
  }

});
