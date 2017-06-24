angular.module('app.controllers', [])

//---------- CONTROLLER FOR THE PROFILE PAGE ----------
.controller('profilePageCtrl', ['$scope',
  function ($scope){

  }])

//---------- CONTROLLER FOR THE FOROT PASSWORD PAGE ----------
.controller('forgotPageCtrl', ['scope',
  function($scope){

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


//---------- CONTROLLER FOR THE REGISTER PAGE ----------
.controller('registerPageCtrl', ['$scope', '$state',
  function ($scope, $state){
    $scope.RegisterUser = function() {
      console.log("registerPageCtrl: Registering");
      firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
      console.log("registerPageCtrl: Registered!");
        var database = firebase.database().ref();     //Add user to database
        var newChildRef = database.push();            //Create a new unique ID
        newChildRef.set({                             //Write to database
          email: $scope.txtEmail,
          name: $scope.txtName
        });
          $state.go('login');
      });
    };
  }]);
