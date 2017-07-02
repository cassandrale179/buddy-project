
angular.module('app.controllers',[])

.service('sharedProperty', ['$scope', '$state',
  function($scope, $state){

  }
])

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
        user.sendEmailVerification().then(function() { //Send email verification
          console.log(user);
            // Email sent.
          }, function(error) {
            // An error happened.
          });

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
      var interestStr = snapshot.val().interest;
      $scope.interestArr = interestStr.split(",");
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

    //CREATE SOME VARIABLES
    var user = firebase.auth().currentUser;
    var id = user.uid;
    var ref = firebase.database().ref("users/"+id);
    var refInterest = firebase.database().ref("interest");
    var jsonObject = {
      //1: gameofthrones
      //2: breakingbad
    };
    $scope.errorMessage = "";
    $scope.interestArr = [];

    //COUNTING THE NUMBER OF CHILD IN DATABASE
    refInterest.once('value', function(snapshot)
  {
      var count = snapshot.numChildren();
      if (user !== null)
      {
        //WHEN USER ADD AN INTEREST
        $scope.AddMore = function(){
          if (!$scope.interest){
            $scope.errorMessage = "Please input an interest";
            return;}                                                      //if nothing is added
          if ($scope.interestArr.indexOf($scope.interest) == -1){         //if interest doesn't exist
            $scope.interestArr.push($scope.interest);
          }
          else{
            $scope.errorMessage = "You already added this interest";
          }
        };

        //WHEN USER REMOVES AN INTEREST
        $scope.Remove = function(x){
           $scope.interestArr.splice(x, 1);
          console.log('Total interests: ' + count);
        };

        //WHEN USER SUBMIT THEIR INTERESTS
        $scope.CaptureInterest = function(){
          for (var i = count; i < $scope.interestArr.length + count; i++){
            jsonObject[i] = $scope.interestArr[i - count];
          }
          refInterest.update(jsonObject);

          //CONCATENATE ALL OBJECTS INTO A STRING
          ref.once('value', function(snapshot){
            var obj = snapshot.val();
            var interestStr = obj.interest;
            for (var k = 0; k< $scope.interestArr.length; k++){
              interestStr+=$scope.interestArr[k] + ',';
            }
            ref.update({interest: interestStr});
            console.log(interestStr);
          });

          $state.go('match');
        };
      }
    });
  }
])

//-------------------  CONTROLLER FOR THE SETTINGS PAGE ------------------------
.controller('settingsPageCtrl', ['$scope', '$state',
  function ($scope, $state){

    $scope.resetPassword = function() {
      var providedPassword = $scope.oldPassword;
      //Reauthenticate user
      firebase.auth().currentUser.reauthenticate(
        firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, providedPassword));
      //Update new providedPassword
      if ($scope.newPassword1===$scope.newPassword2){
        firebase.auth().currentUser.updatePassword($scope.newPassword1);
        console.log($scope.newPassword1);
        console.log("Password reset!");
      }

    };


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
