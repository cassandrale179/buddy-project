angular.module('app.controllers', [])

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
}])

//Register controller
    .controller('registerPageCtrl', ['$scope', '$state',
      function ($scope, $state){
        $scope.RegisterUser = function() {
          console.log("registerPageCtrl: Registering");
          firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
          .then(function(resolve){
            console.log("registerPageCtrl: Registered!");
            //Add user to database
            var database = firebase.database().ref();
            //Create a new unique ID
            var newChildRef = database.push();
            //Write to database
            newChildRef.set({
              email: $scope.txtEmail,
              name: $scope.txtName
            })
            $state.go('login');
        });

        }
      }


  ])
