//-------------------  CONTROLLER FOR OTHER PEOPLE PROFILE PAGE ------------------------
app.controller('otherPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }
    else{
      var matchTableRef = firebase.database().ref("match/" + currentUser.uid);
      matchTableRef.once('value', function(snapshot){
        var matchTable = snapshot.val();
        for (var user in matchTable){
          if ($localStorage.otherId == user){
            $scope.add = 1;
          }
        }
      });
    }

    //Other person's ID is stored in $localStorage in match.js
      var buddyID = $localStorage.otherId;
      var buddyRef = firebase.database().ref("users/" + buddyID);
      buddyRef.once('value', function(buddySnap){
        var snapshot = buddySnap.val();
        $scope.buddyName = snapshot.name;
        $scope.buddyAge = snapshot.age;
        $scope.buddyGender =snapshot.gender;
        $scope.buddyDescription = snapshot.description;
        $scope.buddyArr = snapshot.interest.split(",");
        $scope.buddyPictureUrl = snapshot.pictureUrl;
        console.log($scope.buddyPictureUrl);
        $scope.buddyArr.splice(-1);

        $state.go('other');
      });

      var userRef = firebase.database().ref("users/" + currentUser.uid);
      userRef.once('value', function(userSnap){
        userName = userSnap.name;
      });



      //CHECK IF A PERSON IS ALREADY ADDED AS A FRIEnd

      $scope.message = function() {
        //GET CURRENT TIMESTAMP OF TODAY
        var dateTime = Date.now();
        var todayTimestamp = Math.floor(dateTime/1000);

        //Create 2 references to both people
        var matchRef1 = firebase.database().ref('match/' + currentUser.uid + "/" + $localStorage.otherId);
        var matchRef2 = firebase.database().ref('match/' + $localStorage.otherId + "/" + currentUser.uid);
        var lastText = "You are now connected with " + $scope.buddyName + "!";
        var newMatch = "You got a new match!";
        matchRef1.update({
          convoId: "",
          lastText: lastText,
          lastTimestamp: todayTimestamp,
          readStatus: "unread"
        });
        matchRef2.update({
          convoId: "",
          newMatch: newMatch,
          lastTimestamp: todayTimestamp
        }); 
        $state.go('list');
      };

 }]);
