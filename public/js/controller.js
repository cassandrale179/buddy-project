angular.module('app.controllers', [])

//--------------------  CONTROLLER FOR THE PROFILE PAGE ---------------------------
.controller('profilePageCtrl', ['$scope',
  function ($scope){

  }])

//--------------------  CONTROLLER FOR THE FOROT PASSWORD PAGE --------------------
.controller('forgotPageCtrl', ['scope',
  function($scope){

  }])

//--------------------  CONTROLLER FOR THE LOGIN & REGISTER PAGE --------------------
.controller('loginPageCtrl', ['$scope', '$state',
  function ($scope, $state){
    $scope.LogUser = function ()
  {
      $scope.errorMessage = "";

      //SIGN IN USER
      firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
          console.log("loginPageCtrl: Logged in!");
          var user = firebase.auth().currentUser;
          console.log(user);
          $state.go('interest');
      })

      //CATCHING ERRORS HERE
      .catch(function(error){
        if (error.code == 'auth/wrong-password'){
          $scope.errorMessage = "Incorrect password or user don't have a password";
        }
        if (error.code == 'auth/user-not-found'){
          $scope.errorMessage = "User does not exist in database";
        }
        if (error.code == 'auth/user-disabled'){
          $scope.errorMessage = "This account has been disabled";
        }
        if (error.code == 'auth/invalid-email'){
          $scope.errorMessage = "Email is not valid.";
        }
        console.log(error);
        $state.go('login');
      });
  };
    $scope.RegisterUser = function()
    {
      $scope.errorMessage = "";

      //CREATE AN USER WITH EMAIL AND PASSWORD
        console.log("registerPageCtrl: Registering");
        firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
        .then(function(resolve)
        {
          console.log("registerPageCtrl: Registered!");
          var database = firebase.database().ref('users');               //create a reference to database
          var newChildRef = database.push();                            //create a new unique ID
          newChildRef.set({
               email: $scope.txtEmail
             });

          //EMAIL VERIFICATION
          var user = firebase.auth().currentUser;         //email verification
            user.sendEmailVerification().then(function() {
          });
          $state.go('interest');
        })

      //CATCHING ERROR HERE
        .catch(function(error)
        {
          if (error.code == 'auth/weak-password') {
            $scope.errorMessage = "Password is weak.";
          }
          if (error.code == "auth/email-already-in-use"){
            $scope.errorMessage = "Email is already used by another account";
          }
          if (error.code == 'auth/invalid-email'){
            $scope.errorMessage = "Invalid email";
          }
          console.log(error);
          $state.go('login');
        });
    };
}])

//------------------- CONTROLLER FOR INPUTTING IN INTEREST PAGE --------------------
.controller('interestPageCtrl', ['$scope', '$state',
  function($scope, $state){
    firebase.auth().onAuthStateChanged(function(user){
      if (user){
        user.getToken().then(function(idToken){
          console.log(idToken);
        });
      }
    });

    //DISPLAY CURRENT USER'S INFORMATION
    var user = firebase.auth().currentUser;
    //console.log('Get token of user: ' + user.getToken().id_token);
    if (user !== null){
      user.providerData.forEach(function (profile) {
      console.log("Sign-in provider: " + profile.providerId);
      console.log("Provider-specific UID: " + profile.uid);
      console.log("Email: "+ profile.email);
    });
  }

  //SEND 5 OBJECTS TO THE DATABASE WHEN THE USER CLICK SUBMIT
    $scope.CaptureInterest = function(){
      var database = firebase.database().ref('-KnUfCsabanmemHQS9QF');
      database.update({
        interest1: $scope.i1,
        interest2: $scope.i2,
        interest3: $scope.i3,
        interest4: $scope.i4,
        interest5: $scope.i5
      });
      $state.go('profile');
    };
}]);
