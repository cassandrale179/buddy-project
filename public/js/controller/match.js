app.controller('matchPageCtrl', ['$scope', '$state', '$localStorage', '$sessionStorage',
    function($scope, $state, $localStorage, $sessionStorage){

      //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
      var currentUser = firebase.auth().currentUser;
      if (currentUser === null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
          $state.reload();
        });
      }

      //GET MY INTEREST AND STORE IT IN ARRAY FORMAT
      $scope.myInterest = "";
      var refCurrentUserId = firebase.database().ref("users/" + currentUser.uid);
      refCurrentUserId.once('value').then(function(snapshot){

        //GET THE STRING OF THE CURRENT USER'S INTEREST
        var interestStr = snapshot.val().interest;
        console.log('This is the string: ' + interestStr);
        $scope.myInterest = interestStr.split(",");
        $scope.myInterest.splice(-1);
      });

      //GET EVERYONE ELSE INTEREST IN ARRAY FORMAT
      var refUser = firebase.database().ref("users");
      refUser.once('value', function(snapshot){
          var UserList = [/*[uid, count]*/];
          var UserTable = snapshot.val();

          //LOOP THROUGH ALL USER UID IN THE USER TABLE
          for (var user in UserTable){
            if (user == currentUser.uid) delete UserTable.user;
            else{
              var OtherInterestArr = UserTable[user].interest.split(",");
              OtherInterestArr.splice(-1);

               //FILTER FUNCTION TO COUNT COMMON INTEREST
               $scope.commonInterest = [];
               for (var i = 0; i < $scope.myInterest.length; i++){
                 for (var j = 0; j < OtherInterestArr.length; j++){
                   if ($scope.myInterest[i] == OtherInterestArr[j]){
                    $scope.commonInterest.push($scope.myInterest[i]);
                   }
                 }
               }
              UserList.push([user, $scope.commonInterest]);
            }
          }

          //SORTING THE USER LIST (UID, COMMON INTEREST) AND RETURN THE LENGTH
          UserList.sort(function(a,b){
            return b[1].length - a[1].length;
          });

          console.log(UserList);



        //STORE EVERYTHNG IN $SCOPE.PEOPLE FOR DISPLAY
        //$Scope.people: contains user objects with properties: name, uid, commonInterest
        $scope.people = [];
        refUser.once('value', function(refSnap){
          var UserTable2 = refSnap.val();
          for (var k = 0; k < UserList.length; k++){
            var obj = {
              uid: UserList[k][0],
              name: UserTable2[UserList[k][0]].name,
              commonInterest: UserList[k][1]
            };
            $scope.people.push(obj);
          }
          $state.go('match');
        });



      });
}]);
