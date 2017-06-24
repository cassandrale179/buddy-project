angular.module('app.controllers', [])

//---------- CONTROLLER FOR THE PROFILE PAGE ----------
.controller('profilePageCtrl', ['$scope',
  function ($scope){

  }])

//---------- CONTROLLER FOR THE FOROT PASSWORD PAGE ----------
.controller('forgotPageCtrl', ['scope',
  function($scope){

  }])

//---------- CONTROLLER FOR THE LOGIN & REGISTER PAGE ----------
.controller('loginPageCtrl', ['$scope', '$state',
  function ($scope, $state){
    $scope.LogUser = function ()
    {
      console.log("loginPageCtrl: Logging in");
       firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
        .then(function(resolve){
          console.log("loginPageCtrl: Logged in!");
          $state.go('interest');
      });
    };
    $scope.RegisterUser = function()
    {
      $scope.errorMessage = "";
      console.log("registerPageCtrl: Registering");
      firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .catch(function(error){                                   // Handle Errors here
        var errorCode = error.code;
        $scope.errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          $scope.errorMessage = "The password is too weak";
          $state.go('login');
        }
        console.log(error);
      })
      .then(function(resolve)
      {
        console.log("registerPageCtrl: Registered!");
        var database = firebase.database().ref();               //create a reference to database
        var newChildRef = database.push();                      //create a new unique ID
        newChildRef.set({
          email: $scope.txtEmail
        });
          $state.go('interest');
      });
    };
}])

//---------- CONTROLLER FOR INPUTTING IN INTEREST PAGE ----------
.controller('interestPageCtrl', ['$scope', '$state',
  function($scope, $state){
    $scope.CaptureInterest = function(){
      var database = firebase.database().ref('-KnMU6XxnQHRykPDk3Za');
      database.update({
        interest2: $scope.i1
      });
      $state.go('profile');
    };
}]);
