var app = angular.module('app.controllers',['ngStorage', 'firebase']);
//Handle file input
app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
})

.factory('Message', '$firebaseArray', function($firebaseArray) {
  var ref = firebase.database().ref().child('messages');
  var messages = $firebaseArray(ref);
  var Message =
  {
    all: messages,
    create: function(message) {
      return messages.$add(message);
    }
    // get: function(messageId) {
    //   return ref.child('messageId').$asObject();
    // },
    // delete: function(message) {
    //   return message.$remove(message);
    // }
  };
})

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
          email: $scope.txtEmail,
          age: $scope.txtAge,
          interest: ""
        };
        ref.child(user.uid).set(info);
        user.sendEmailVerification().then(function() {
          console.log(user);
          }, function(error) {
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
.controller('loginPageCtrl', ['$scope', '$state', '$localStorage', '$sessionStorage',
    function($scope, $state, $localStorage, $sessionStorage){
      //Redirect page if user already logged in
      $scope.init = function() {
        //IF LOCAL STORAGE ALREADY EXIST, THEN LOGIN AUTOMATICALLY
        if ($localStorage.email && $localStorage.password)
        {
          firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
          $state.go('profile');
        }
      };

      //LOGGING USER IN
      $scope.LogUser = function() {
        $scope.errorMessage = "";
        var saveUserInfo = function() {
          $localStorage.email = $scope.txtEmail;
          $localStorage.password = $scope.txtPassword;

        };

          //IF LOCAL STORAGE ALREADY EXIST, THEN LOGIN AUTOMATICALLY
          if ($localStorage.email && $localStorage.password)
          {
            firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
            $state.go('profile');
          }

          //ELSE FORCE THE USER TO SIGN IN WITH PASSWORD AND EMAIL
          else{
          firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
          .then(function(resolve){
              console.log("loginPageCtrl: Logged in!");
              saveUserInfo();
              console.log("Email: " + $localStorage.email);
              console.log("password: " + $localStorage.password);
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
        }
        };
      }])


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
.controller('profilePageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
  firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password)
  .then(function(){
    var user = firebase.auth().currentUser;

    //DECLARING SOME VARIABLES
    if (user !== null){
      var id = user.uid;
      var ref = firebase.database().ref("users/" + id);
      var storageRef = firebase.storage().ref("Avatars/"+id+"/avatar.jpg");
      var profilePic = document.getElementById("profilePic");
      storageRef.getDownloadURL().then(function(url)
    {
      if(url)
      {
        profilePic.src=url;
      }
    });

      //THIS ALLOW THE USER TO UPLOAD THEIR PROFILE PIC
      $scope.uploadFile = function(event){
        var file = event.target.files[0];
        storageRef.put(file).then(function(snapshot){
          console.log("File uploaded!");

          storageRef.getDownloadURL().then(function(url)
        {
          profilePic.src = url;
        });
        });
      };

      // DISPLAY THE USER INTEREST
      ref.once('value').then(function(snapshot){
        $scope.name = snapshot.val().name;
        $scope.age = snapshot.val().age;
        var interestStr = snapshot.val().interest;
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('profile');
      });
    }
    });


}])


//--------------------  CONTROLLER FOR THE MATCH PAGE ---------------------------
.controller('matchPageCtrl', ['$scope', '$state',
  function ($scope, $state){

    var currentUser = firebase.auth().currentUser;
    var matchTable = firebase.database().ref("match");
    matchTable.once('value', function(snapshot){
      var matchObject = snapshot.val();
      if (snapshot.hasChild(currentUser.uid)){
        var userNode = firebase.database().ref("match/" + currentUser.uid);
        userNode.once('value', function(snap){
          var userNodeObject = snap.val();
          $scope.numberofMatches = snap.numChildren();
          var buddyID = userNodeObject[$scope.numberofMatches - 1];
          var buddyRef = firebase.database().ref("users/" + buddyID);

          //TAKEN A SNAPSHOT OF THE BUDDY'S ID AND DISPLAY THEIR NAME AND PICTURE
          buddyRef.once('value', function(buddySnap){
            var buddyNodeObject = buddySnap.val();
            $scope.BuddyName = buddySnap.val().name;
            var buddyProfilePic = document.getElementById("buddyProfilePic");
            var storageRef = firebase.storage().ref("Avatars/"+buddyID+"/avatar.jpg");
            storageRef.getDownloadURL().then(function(url){
              buddyProfilePic.src=url;
            });
            $state.go('match');
          });
        });
      }

    });


    //IF THE USER HASN'T BEEN MATCHED YET
    $scope.MatchMe = function(){

      //CREATE SOME VARIABLES AND GET MY INTEREST
      var refUser = firebase.database().ref("users");
      var refCurrentUserId = firebase.database().ref("users/" + currentUser.uid);
      refCurrentUserId.once('value').then(function(snapshot){
        var interestStr = snapshot.val().interest;
        $scope.myInterest = interestStr.split(",");
        $scope.myInterest.splice(-1);
      });

      //GET EVERYONE'S INTEREST, AND IGNORE MY INTEREST
      refUser.once('value', function(snapshot)
      {
      var UserList = [/*[uid, count]*/];
      console.log("This is the current user's interest: " + $scope.myInterest);
      var table = snapshot.val();
        for (var user in table)
        {
          if (user == currentUser.uid) delete table.user;
          else{
            var interest = table[user].interest;
            var otherInterest = interest.split(",");
            otherInterest.splice(-1);

            //FILTER FUNCTION TO COUNT COMMON INTEREST
            var count = 0;
            for (var i = 0; i < $scope.myInterest.length; i++){
              for (var j = 0; j < otherInterest.length; j++){
                if ($scope.myInterest[i] == otherInterest[j]) count++;
              }
            }
            UserList.push([user, count]);
          }
        }

        //SORTING THE USER LIST AND RETURN YOUR MATCHED BUDDY
        UserList.sort(function(a,b){
          return b[1] - a[1];
        });
        var buddyID = UserList[0][0];

        //PUSHING THE ID TO THE MATCH TABLE
        var refMatch = firebase.database().ref("match/" + currentUser.uid);
        var matchObject = {};
        refMatch.once('value', function(snapshot){
          var count = snapshot.numChildren();
          matchObject[count] = buddyID;
          refMatch.update(matchObject);
        });


        //DISPLAY THE MATCHED USER ONTO THE SCREEN
        var buddyRef = firebase.database().ref("users/" + buddyID);
        buddyRef.once('value', function(snapshot){
          $scope.BuddyName = snapshot.val().name;
          var buddyProfilePic = document.getElementById("buddyProfilePic");
          var storageRef = firebase.storage().ref("Avatars/"+buddyID+"/avatar.jpg");
          storageRef.getDownloadURL().then(function(url)
        {
          buddyProfilePic.src=url;
        });
          $state.go('match');
        });
    });
  };
}])


//--------------------  CONTROLLER FOR THE INTEREST PAGE ---------------------------
.controller('interestPageCtrl', ['$scope', '$state',
  function($scope, $state){

    //CREATE SOME VARIABLES
    var user = firebase.auth().currentUser;
    var id = user.uid;
    var refUserId = firebase.database().ref("users/"+id);
    var refInterest = firebase.database().ref("interests");
    $scope.errorMessage = "";

    //GET THE CURRENT USER INTEREST
    refUserId.once('value', function(snapshot){
      var interestStr = snapshot.val().interest;
      if (interestStr === null) $scope.interestArr = {};
      else{
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('interest');
      }
    });


    refInterest.once('value', function(snapshot)
  {
      if (user !== null)
      {
        //WHEN USER ADD AN INTEREST
        $scope.AddMore = function(){

          //REMOVE ALL CAPITAL LETTERS AND SPACES
          $scope.interest = $scope.interest.toLowerCase();
          $scope.interest = $scope.interest.replace(/\s/g, '');

          //ONLY ADDING IF THE INTEREST IS NOT A DUPLICATE
          if (!$scope.interest){
            $scope.errorMessage = "Please input an interest";
            return;}
          if ($scope.interestArr.indexOf($scope.interest) == -1){
            $scope.interestArr.push($scope.interest);
            $scope.interest = null;
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

          //ADD THEIR INTEREST TO THE INTERESTS TABLE
          var interestTable = snapshot.val();
          for (var i = 0; i < $scope.interestArr.length; i++){
            var info = {
              count: 0,
              match: 0
            };
            refInterest.child($scope.interestArr[i]).set(info);
          }

          //ADD THEIR INTEREST AS A STRING IN THE USER TABLE
          refUserId.once('value', function(snapshot){
            var obj = snapshot.val();
            var interestStr = obj.interest;
            if (!obj.Interest){
              interestStr="";
            }
            for (var k = 0; k< $scope.interestArr.length; k++){
              interestStr+=$scope.interestArr[k] + ',';
            }
            refUserId.update({interest: interestStr});
            console.log(interestStr);
          });

          $state.go('match');
        };
      }
    });
  }
])

//-------------------  CONTROLLER FOR THE SETTINGS PAGE ------------------------
.controller('settingsPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    $scope.successMessage = "";
    $scope.resetPassword = function() {
      var providedPassword = $scope.oldPassword;

      //Reauthenticate user
      firebase.auth().currentUser.reauthenticate(
        firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, providedPassword)
      )
        .then(function(resolve){
          if ($scope.newPassword1===$scope.newPassword2){
            firebase.auth().currentUser.updatePassword($scope.newPassword1);
            $scope.successMessage = "Password reset!";
          }
          console.log('Successfully reauthenticated');
        })
        .catch(function(error){
          if (error.code == 'auth/wrong-password'){
            $scope.errorMessage = "Incorrect password";
          }
        });
        $state.go('settings');
    };


    // FUNCTION TO LOG OUT USER
    $scope.LogOutUser = function()
    {
      var auth = firebase.auth();
      auth.signOut().then(function() {
        console.log("logged out!");
        $localStorage.email=null;
        $localStorage.password=null;
        $state.go('login');
      }, function(error){
        console.log("An error happened!");
      });
    };
  }
])

.controller('messagePageCtrl', ['$scope', '$state', 'Message',
  function ($scope, $state, Message){
    // $scope.messages = Message.all;
    // $scope.insert = function(message) {
    //   Message.create(message);
    // };
}]);
