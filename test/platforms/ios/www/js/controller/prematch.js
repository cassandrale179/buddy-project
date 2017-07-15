app.controller('prematchPageCtrl', ['$scope', '$state', '$localStorage',
  function matchFunction($scope, $state, $localStorage){

    //IF USER CLICK MATCH ME


      //GLOBAL VARIABLES TO BE USED
      $scope.myInterest = "";
      var currentUser = firebase.auth().currentUser;
      if (!currentUser){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
      }
      console.log('This is the current user ID: ' + currentUser.uid);


      //CREATE SOME VARIABLES AND GET MY INTEREST
      var refUser = firebase.database().ref("users");
      var refCurrentUserId = firebase.database().ref("users/" + currentUser.uid);
      refCurrentUserId.once('value').then(function(snapshot){
        var interestStr = snapshot.val().interest;
        console.log('This is the string: ' + interestStr);
        $scope.myInterest = interestStr.split(",");
        $scope.myInterest.splice(-1);
      });

  $scope.MatchMe = function(){

      //GET EVERYONE'S INTEREST, AND IGNORE MY INTEREST
      refUser.once('value', function(snapshot)
    {
      var UserList = [/*[uid, count]*/];
      console.log("This is the current user's interest: " + $scope.myInterest);
      //Create a list of all users except for the current user
      var table = snapshot.val();
        for (var user in table){

          //FIND THE CURRENT USER ID AND DELETE THEM FROM LIST OF POTENTIAL MATCHES
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

        //STORE THE MOST RECENT MATCH UNDER THE USER TABLE (BUDDY: YFxbY6C074eUIegNTyKVvnBvOzz2)
        refCurrentUserId.update({buddy: buddyID});

        //STORE THE MOST RECENT MATCH UNDER THE OTHER USER'S TABLE
        var refMatch = firebase.database().ref("match/" + currentUser.uid + "/" + buddyID);
        var refMatchOther = firebase.database().ref('match/'+buddyID + "/" + currentUser.uid);



        //PUSH THE MATCH OBJECT UNDER THE COMMON NODE OF MATCH TABLE (FOR BOTH USERS)
        var commonNode = firebase.database().ref("match/" + currentUser.uid + "/" + buddyID + "/" + "common");
        var otherCommonNode = firebase.database().ref("match/" + buddyID + "/" + currentUser.uid+"/common");
          commonNode.update(commonInterest).then(function(resolve){
            //COMMON INTEREST FOR THE 2nd USER
            otherCommonNode.update(commonInterest);
            matched = true;
            $state.go('match');
          });

    });
  };
}]);
