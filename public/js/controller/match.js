app.controller('matchPageCtrl', ['$scope', '$state',
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
      //Create a list of all users except for the current user
      var table = snapshot.val();
        for (var user in table){
          //Delete current user from table
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

        //PUSHING THE ID, NAME AND THE COMMON INTERESTS TO THE MATCH TABLE
        var refMatch = firebase.database().ref("match/" + currentUser.uid);
        //Push the name
        var refMatchBuddyId = refMatch.child(buddyID);
        var buddyName = table.buddyID.name;
        var buddyNameObj = {
          name: buddyName
        };
        refMatchBuddyId.update(buddyNameObj);
        //Push the common interest
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
}]);
