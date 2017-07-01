angular.module('app.controllers', [])


.factory("interestFactory", function() {
  var username = "";
  //Create new node and store id in uid
  // var createNewUserId = function() {
  //   var database = firebase.database().ref('users');               //create a reference to database
  //   var newChildRef = database.push();                            //create a new unique ID
  //   uid = newChildRef.key;
  // }

  //Return the uid
  var setUsername = function(txtUsername) {
    username = txtUsername;
  }

  var getUsername = function() {
    return username;
  }

  //Add interest
  var addInterest = function(i1, i2, i3, i4, i5, username) {
    var ref = firebase.database().ref('users/' + username);
    var interests = {
      interest1: i1,
      interest2: i2,
      interest3: i3,
      interest4: i4,
      interest5: i5
    };
    ref.update(interests);
  }
  // var getInterests = function() {
  //   return interests;
  // }
  return {
    setUsername : setUsername,
    addInterest: addInterest,
    getUsername : getUsername
    // getInterests : getInterests
  }
})

//--------------------  CONTROLLER FOR THE PROFILE PAGE ---------------------------
.controller('profilePageCtrl', ['$scope',
  function ($scope){

}])

//--------------------  CONTROLLER FOR THE FOROT PASSWORD PAGE --------------------
.controller('forgotPageCtrl', ['$scope', '$state',
  function($scope, $state){
    $scope.errorMessage = "";
    $scope.successMessage = "";
    $scope.ResetPassword = function()
  {
      var auth = firebase.auth();
      auth.sendPasswordResetEmail($scope.txtEmail)
      .then(function(resolve) {
        $scope.successMessage = "Password reset email sent!";
        $state.go('forgot');
      })
      .catch(function(error) {
        if (error.code == 'auth/user-not-found'){
          $scope.errorMessage = "User does not exist in database";
        }
        console.log(error);
        $state.go('forgot');
      });
    };
}])


//-------------------  CONTROLLER FOR THE SETTINGS PAGE ------------------------
.controller('settingsPageCtrl', ['$scope', '$state',
  function ($scope, $state){

    // FUNCTION TO LOG OUT USER
    $scope.LogOutUser = function()
    {
      var auth = firebase.auth();
      auth.signOut().then(function() {
        console.log("logged out!");
        $state.go('login');
      }, function(error){
        console.log("An error happened!");
      });
    };
  }
])


//--------------------  CONTROLLER FOR THE LOGIN & REGISTER PAGE --------------------
.controller('loginPageCtrl', ['$scope', '$state', 'interestFactory',
  function ($scope, $state, interestFactory){

    $scope.LogUser = function ()
  {
      // console.log(interestFactory.getUid());
      $scope.errorMessage = "";
      console.log(interestFactory.getUsername());


      //SIGN IN USER
      firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
          console.log("loginPageCtrl: Logged in!");
          var user = firebase.auth().currentUser;
          interestFactory.setUsername($scope.txtUsername);
          console.log(user);
          $state.go('profile');
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
          interestFactory.setUsername($scope.txtUsername);
          var username = interestFactory.getUsername();
          console.log("Register page email: " + username);


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
.controller('interestPageCtrl', ['$scope', '$state', 'interestFactory',
  function($scope, $state, interestFactory){

  //SEND 5 OBJECTS TO THE DATABASE WHEN THE USER CLICK SUBMIT
    $scope.CaptureInterest = function(){

      var username = interestFactory.getUsername();
      console.log("Interest page username: " + username);

      interestFactory.addInterest($scope.i1, $scope.i2, $scope.i3, $scope.i4, $scope.i5, username);
      console.log("interest added!");
      $state.go('profile');
    };
}])

//--------------------  CONTROLLER FOR THE SETTINGS PAGE --------------------
.controller('matchPageCtrl', ['$scope',
  function ($scope){

}])
.controller('settingsPageCtrl', ['$scope',
  function ($scope){

}]);

/* DISPLAY CURRENT USER'S INFORMATION
  var user = firebase.auth().currentUser;
  console.log('Get token of user: ' + user.getToken().accessToken);
  if (user !== null){
    user.providerData.forEach(function (profile) {
    console.log("Sign-in provider: " + profile.providerId);
    console.log("Provider-specific UID: " + profile.uid);
    console.log("Email: "+ profile.email);
  });
} */
