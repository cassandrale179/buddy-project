angular.module('app.controllers', [])

    .controller('portalPageCtrl', ['$scope',
        function ($scope){

        }])

    .controller('loginPageCtrl', ['$scope', '$state',
      function ($scope, $state){
        $scope.LogUser = function (){
          console.log("loginPageCtrl: Logging in");
          firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
          .then(function(resolve){
            console.log("loginPageCtrl: Logged in!");
            $state.go('portal');
          });
  };
}]);
