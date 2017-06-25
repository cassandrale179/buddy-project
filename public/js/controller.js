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
    $scope.LogUser = function ()
    {
      console.log("loginPageCtrl: Logging in");
       firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
        .then(function(resolve){
          console.log("loginPageCtrl: Logged in!");
          $state.go('profile');
      });
    };
    $scope.RegisterUser = function()
    {
      $scope.errorMessage = "";
      console.log("registerPageCtrl: Registering");
      firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .catch(function(error){
        // Handle Errors here.
        var errorCode = error.code;
        $scope.errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          $scope.errorMessage = "The password is too weak";
          $state.go('login');
        }
        if (errorCode == 'auth/email-already-in-use') {
          $scope.errorMessage = "The email is already in use.";
          $state.go('login');
        }
        console.log(error);
      })
      .then(function(resolve)
      {
        console.log("registerPageCtrl: Registered!");
        var database = firebase.database().ref();        //create a reference to database
        var newChildRef = database.push();              //create a new unique ID
        newChildRef.set({
          email: $scope.txtEmail
        });

        var user = firebase.auth().currentUser;         //email verification
        user.sendEmailVerification().then(function() {
          // Email sent.
        }, function(error) {
          // An error happened.
        });
          $state.go('profile');
      });
    };
}]);
