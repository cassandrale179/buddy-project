angular.module('app.controllers', [])

//--------------------  CONTROLLER FOR THE REGISTER PAGE --------------------
.controller('registerPageCtrl', ['$scope', '$state',
  function ($scope, $state){
    $scope.RegisterUser = function(){

      $scope.errorMessage = "";

      //------------CREATE A NEW USER------------
      firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
        console.log("registerPageCtrl: Registered!");
        var ref = firebase.database().ref("users");
        var user = firebase.auth().currentUser;
        var info = {
          name: $scope.txtName,
          email: $scope.txtEmail
        };
        ref.child(user.uid).set(info);
        $state.go('interest');
      })

      //------------CATCHING ERROR HERE------------
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
        $state.go('register');
      });
    };
  }
])

//------------------------------  CONTROLLER FOR THE LOGIN PAGE --------------------
.controller('loginPageCtrl', ['$scope', '$state',
  function ($scope, $state){
    $scope.LogUser = function ()
    {
      $scope.errorMessage = "";

      //------------SIGN IN USER------------
      firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
          console.log("loginPageCtrl: Logged in!");
          var user = firebase.auth().currentUser;
          console.log(user);
          $state.go('profile');
      })

      //------------CATCH THE ERROR HERE--------
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
  }
])


//--------------------  CONTROLLER FOR THE FORGOT PASSWORD PAGE --------------------
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

//--------------------  CONTROLLER FOR THE PROFILE PAGE ---------------------------
.controller('profilePageCtrl', ['$scope', '$state',
  function ($scope, $state){
  var user = firebase.auth().currentUser;
  if (user !== null){
    var id = user.uid;
    var ref = firebase.database().ref("users/" + id);
    ref.once('value').then(function(snapshot){
      $scope.name = snapshot.val().name;
      $scope.i1 = snapshot.val().interest1;
      $scope.i2 = snapshot.val().interest2;
      $scope.i3 = snapshot.val().interest3;
      $scope.i4 = snapshot.val().interest4;
      $scope.i5 = snapshot.val().interest5;
      $state.go('profile');
    });
  }
}])


//--------------------  CONTROLLER FOR THE MATCH PAGE ---------------------------
.controller('matchPageCtrl', ['$scope', '$state',
  function ($scope, $state){
}])


//--------------------  CONTROLLER FOR THE INTEREST PAGE ---------------------------
.controller('interestPageCtrl', ['$scope', '$state',
  function($scope, $state){
    var user = firebase.auth().currentUser;
    var ref = firebase.database().ref("users");
    if (user !== null){
      $scope.CaptureInterest = function()
      {
        var interests = {
          interest1: $scope.i1,
          interest2: $scope.i2,
          interest3: $scope.i3,
          interest4: $scope.i4,
          interest5: $scope.i5
        };
        ref.child(user.uid).update(interests);
        $state.go('match');
      };
    }
  }
])

//---------------  CONTROLLER FOR THE SECOND INTEREST PAGE ----------------------
.controller('dynamicPage', ['$scope', '$state',
  function($scope, $state){
    var user = firebase.auth().currentUser;
    if (user !== null){
      var ref = firebase.database().ref("users/" + user.uid);
      ref.once("value").then(function(snapshot){
        var i1 = snapshot.val().interest1;
        var i2 = snapshot.val().interest2;
        var i3 = snapshot.val().interest3;
        var i4 = snapshot.val().interest4;
        var i5 = snapshot.val().interest5;
        $scope.interestArr = [i1, i2, i3, i4, i5];
        console.log($scope.interestArr);
        $state.go('dynamic');
      });
    }
  }
])


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
]);
