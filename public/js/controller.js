angular.module('app.controllers', [])

    //---------- CONTROLLER FOR THE PROFILE PAGE ----------
    .controller('profilePageCtrl', ['$scope',
        function ($scope){

        }])

    //---------- CONTROLLER FOR THE LOGIN PAGE ----------
    .controller('loginPageCtrl', ['$scope', '$state',
      function ($scope, $state){
        $scope.LogUser = function (){
          console.log("loginPageCtrl: Logging in");
          firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
          .then(function(resolve){
            console.log("loginPageCtrl: Logged in!");
            $state.go('profile');
          });
  };
}]);
