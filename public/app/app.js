// INITILIZE APP
// ============================================================
angular.module("app", ["ui.router"])

  // CONFIG
  // ============================================================
  .config(function($stateProvider, $urlRouterProvider) {

    // INITILIZE STATES
    // ============================================================
    $stateProvider

      // HOME STATE
      .state('home', {
        url: '/home',
        templateUrl: './app/routes/home/homeTmpl.html',
        controller: 'homeCtrl'
      })

      // COHORTS STATE
      .state('cohorts', {
        url: '/cohorts',
        templateUrl: './app/routes/cohorts/cohortsTmpl.html',
        controller: 'cohortsCtrl',
        resolve: {
          cohorts: function(cohortService) {
            return cohortService.getCohorts();
          },
          user: function(loginService, $state){
            return loginService.getCurrentUser().then(function(response){
              if(!response.data){
                $state.go('home')
              }
              return response.data;
            })
            .catch(function(err){
              $state.go('home')
            })
          }
        }
      })

      // STUDENTS STATE
      .state('students', {
        url: '/students/:cohort_id',
        templateUrl: './app/routes/students/studentsTmpl.html',
        controller: 'studentsCtrl',
        resolve: {
          pairs: function(cohortService, $stateParams) {
            return cohortService.getPairs($stateParams.cohort_id);
          },
          user: function(loginService, $state){
            return loginService.getCurrentUser().then(function(response){
              if(!response.data){
                $state.go('home')
              }
              return response.data;
            })
            .catch(function(err){
              $state.go('home')
            })
          }
        }
      });




    // ASSIGN OTHERWISE
    // ============================================================
    $urlRouterProvider.otherwise('/home');
  });
