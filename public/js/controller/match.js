app.controller('matchPageCtrl', ['$scope', '$state', '$localStorage',
  function matchFunction($scope, $state, $localStorage){


    //GLOBAL VARIABLES TO BE USED
    var currentUser = firebase.auth().currentUser;
    var matched = false;
    if (!currentUser){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
    }

    //CHECK IF USER ALREADY HAS A CURRENT BUDDY
    if (currentUser !== null){
      var userRef = firebase.database().ref("users/" + currentUser.uid);
      userRef.once('value', function(snapshot)
      {
        $scope.buddy = snapshot.val().buddy;
        if ($scope.buddy === ""){
          $scope.exist = false;
          $state.go('prematch');
        }

        //TAKE A SNAPSHOT OF BUDDY AND DISPLAY HIS/HER INFORMATION
        if ($scope.buddy !== ""){
          var buddyRef = firebase.database().ref("users/" + $scope.buddy);
          buddyRef.once('value', function(buddySnap)
          {
            var buddyNodeObject = buddySnap.val();
            $scope.BuddyName = buddySnap.val().name;
            $state.go('match');
          });

          var buddyProfilePic = document.getElementById("buddyProfilePic");
          var storageRef = firebase.storage().ref("Avatars/"+$scope.buddy+"/avatar.jpg");
          storageRef.getDownloadURL().then(function(url){
            buddyProfilePic.src=url;
          });

          //TAKE A SNAPSHOT OF THE MATCH TABLE TO DISPLAY COMMON INTEREST
          var matchRef = firebase.database().ref("match/" + currentUser.uid + "/" + $scope.buddy + "/" + "common");
          matchRef.once('value', function(matchSnap){
            $scope.commonInterest = matchSnap.val();
            $state.go('match');
          });
        }
      });
    }
}]);
