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
});



//--------------------  CONTROLLER FOR THE REGISTER PAGE --------------------
app.controller('registerPageCtrl', ['$scope', '$state',
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
          interest: "",
          buddy: ""
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

    $scope.show = 1;

    //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
    var user = firebase.auth().currentUser;
    if (user===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    //DECLARING SOME VARIABLES
    if (user !== null)
  {
      var id = user.uid;
      var ref = firebase.database().ref("users/" + id);
      var storageRef = firebase.storage().ref("Avatars/"+id+"/avatar.jpg");
      var profilePic = document.getElementById("profilePic");
      storageRef.getDownloadURL().then(function(url){
        if(url){profilePic.src=url;}
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

      // DISPLAY THE USER INTEREST AND BIO
      ref.once('value').then(function(snapshot){
        $scope.name = snapshot.val().name;
        $scope.age = snapshot.val().age;
        $scope.gender = snapshot.val().gender;
        $scope.description = snapshot.val().description;
        var interestStr = snapshot.val().interest;
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('profile');
      });

  }


}])


//--------------------  CONTROLLER FOR THE MATCH PAGE ---------------------------
.controller('matchPageCtrl', ['$scope', '$state',
  function matchFunction($scope, $state){

    //GLOBAL VARIABLES TO BE USED
    var currentUser = firebase.auth().currentUser;

    //CHECK IF USER ALREADY HAS A CURRENT BUDDY
    if (currentUser !== null){
      var userRef = firebase.database().ref("users/" + currentUser.uid);
      userRef.once('value', function(snapshot)
      {
        $scope.buddy = snapshot.val().buddy;
        if ($scope.buddy === ""){
          $scope.exist = false;
          $state.go('match');
        }

        //TAKE A SNAPSHOT OF BUDDY AND DISPLAY HIS/HER INFORMATION
        if ($scope.buddy !== ""){
          $scope.exist = true;
          var buddyRef = firebase.database().ref("users/" + $scope.buddy);
          buddyRef.once('value', function(buddySnap)
          {
            var buddyNodeObject = buddySnap.val();
            $scope.BuddyName = buddySnap.val().name;
            var buddyProfilePic = document.getElementById("buddyProfilePic");
            var storageRef = firebase.storage().ref("Avatars/"+$scope.buddy+"/avatar.jpg");
            storageRef.getDownloadURL().then(function(url){
              buddyProfilePic.src=url;
            });
            $state.go('match');
          });

          //TAKE A SNAPSHOT OF THE MATCH TABLE TO DISPLAY COMMON INTEREST
          var matchRef = firebase.database().ref("match/" + currentUser.uid + "/" + $scope.buddy);
          matchRef.once('value', function(matchSnap){
            $scope.commonInterest = matchSnap.val();
            $state.go('match');
          });
        }
      });
    }

    //IF THE USER HASN'T BEEN MATCHED YET, AND THEY CLICK MATCH ME
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
        for (var user in table){
          if (user == currentUser.uid) delete table.user;
          else{
            var interest = table[user].interest;
            var otherInterest = interest.split(",");
            otherInterest.splice(-1);

            //FILTER FUNCTION TO COUNT COMMON INTEREST
            $scope.commonInterest = [];
            for (var i = 0; i < $scope.myInterest.length; i++){
              for (var j = 0; j < otherInterest.length; j++){
                if ($scope.myInterest[i] == otherInterest[j]){
                  $scope.commonInterest.push($scope.myInterest[i]);
                }
              }
            }
            UserList.push([user, $scope.commonInterest]);
          }
        }

        //SORTING THE USER LIST AND RETURN YOUR MATCHED BUDDY AND THE COMMON INTEREST
        UserList.sort(function(a,b){
          return b[1].length - a[1].length;
        });
        var buddyID = UserList[0][0];
        var commonInterest = UserList[0][1];
        console.log("This is the buddy's ID: " + buddyID);
        console.log("This is the common interest: " + commonInterest);

        //STORE THE MOST RECENT MATCH UNDER THE USER TABLE
        refCurrentUserId.update({buddy: buddyID});

        //PUSHING THE ID AND THE COMMON INTERESTS TO THE MATCH TABLE
        var refMatch = firebase.database().ref("match/" + currentUser.uid);
        refMatch.once('value', function(snapshot){
          var matchObject = {};
          matchObject[buddyID] = commonInterest;
          refMatch.update(matchObject).then(function(resolve){
            $scope.exist = true;
            $state.go('match');
          });
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
]);

//----------------------------  FACTORY FOR THE MESSAGE PAGE -----------------------------------
app.factory('Message', ['$firebaseArray',
  function($firebaseArray) {
  var messageRef = firebase.database().ref('messages');
  // var convo = $firebaseArray(convoRef);
  var convo;
  var matchRef;
  var convoRef;
  var convoId;
  var uid1;
  var uid2;


  var Message =
  {
    create: function (msg) {
      return convo.$add(msg);
    },
    delete: function (msg) {
      return convo.$remove(msg);
    },

    //
    getConvoId: function(database, userId1, userId2) {
      matchRef1 = firebase.database().ref('match/'+ userId1 + "/" + userId2);
      matchRef2 = firebase.database().ref('match/'+ userId2+ "/" + userId1);

      console.log("Current database convoID:" + database.convoId);

      //IF CONVO ID EXIST, OUTPUT IT. ELSE CREATE NEW ONE
      if (database.convoId){
        convoId = database.convoId;
      }
      else{
        messageRef.push();
        convoId = messageRef.key;
      }

      //CREATE A CONVO ID UNDER THE MESSAGE TABLE
      convoRef = messageRef.child(convoId);
      convo = $firebaseArray(convoRef);
      var conversation = {
        convoId: convoId //convoID: XOsksjdsjdad
      };

      //PUT THESE CONVO ID UNDER BOTH USER MATCH TABLE
      matchRef1.update(conversation);
      matchRef2.update(conversation);
      console.log("Convo id:"+ convoId);
      return convo;
    },

    //RETURN THE CONVO ID
    returnConvoId: convoId,

    //SET THE USER ID FOR BOTH PARTICIPANTS
    setUid: function(userId1, userId2){
      uid1 = userId1;
      uid2 = userId2;
    },
    returnUid1: function() {
      return uid1;
    },
    returnUid2: function() {
      return uid2;
    }
  };
  return Message;
}]);

//----------------------------  CONTROLLER FOR THE MESSAGE PAGE -----------------------------------
app.controller('messagePageCtrl', ['$scope', '$state', 'Message', '$firebaseArray', '$localStorage',
  function ($scope, $state, Message, $firebaseArray, $localStorage){

    //IF USER IS NULL, SIGN THEM BACK IN AND GET THEIR UID
      var user = firebase.auth().currentUser;
      if (user===null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
          $state.reload();
        });
      }
      var uid1 = user.uid;

      //Root reference
      var rootRef = firebase.database().ref();
      rootRef.once("value", function(snapshot)
      {

        //Get ID of the user's buddy
        var userDatabase = snapshot.child("users/" + uid1).val();
        var uid2 = userDatabase.buddy;
        Message.setUid(uid1, uid2);

        //Check ID of the 2 people in conversation
        console.log("now log the 2 IDs of the two people in a chat");
        console.log("uid1: " + Message.returnUid1());
        console.log("uid2: " + Message.returnUid2());

        //Get reference to both user's match table
        var userMatchRef1 = firebase.database().ref('match/'+uid1+"/"+uid2);
        var userMatchRef2 = firebase.database().ref('match/'+uid2+"/"+uid1);

        //OUTPUT THE MESSAGE IN CONVO SCOPE ARRAY
        var matchDatabase = snapshot.child("match/" + uid1 + "/" + uid2).val();
        $scope.convo = Message.getConvoId(matchDatabase, uid1, uid2);

        /*--------- HOW TO LOOP THROUGH FIREBASE ARRAY ----------------
        $scope.convo.$loaded()
        .then(function(){
          angular.forEach($scope.convo, function(message){
            if (message.sender == uid1) $scope.myStyle = {color: 'red'};
            if (message.sender == uid2) $scope.myStyle = {color: 'blue'};
          });
        });*/


        $scope.setColor = function(message){
          if (message.sender == uid1) return { color: "red"};
          if (message.sender == uid2) return { color: "blue"};
        };




        //SET THE INSERT FUNCTION FROM VIEW TO CREATE FUNCTION
        $scope.insert = function(message) {
          $scope.newmessage.sender = uid1;
          $scope.newmessage.receiver = uid2;
          Message.create(message);

          };
      });
}])


//-------------------  CONTROLLER FOR OTHER PEOPLE PROFILE PAGE ------------------------
.controller('otherPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    var userRef = firebase.database().ref("users/" + currentUser.uid);
    userRef.once('value', function(snapshot){
      var buddyID = snapshot.val().buddy;
      var buddyRef = firebase.database().ref("users/" + buddyID);
      buddyRef.once('value', function(buddySnap){
        $scope.buddyName = buddySnap.val().name;
        $scope.buddyAge = buddySnap.val().age;
        $scope.buddyGender = buddySnap.val().gender;
        $scope.buddyDescription = buddySnap.val().description;
        $scope.buddyArr = buddySnap.val().interest.split(",");
        $scope.buddyArr.splice(-1);
        var buddyProfilePic = document.getElementById("buddyProfilePic");
        var storageRef = firebase.storage().ref("Avatars/"+buddyID+"/avatar.jpg");
        storageRef.getDownloadURL().then(function(url){
          buddyProfilePic.src=url;
        });
        $state.go('other');
      });
    });

 }])

//-------------------  CONTROLLER FOR THE RESOURCES PAGE ------------------------
.controller('resourcesPageCtrl', ['$scope', '$state',
  function ($scope, $state){
}])

.controller('hotlinesPageCtrl', ['$scope', '$state',
  function ($scope, $state){
}]);
