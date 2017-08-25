app.controller('matchPageCtrl', ['$scope', '$state', '$localStorage', '$sessionStorage',
    function($scope, $state, $localStorage, $sessionStorage){



      //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
      var currentUser = firebase.auth().currentUser;
      if (currentUser === null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
          $state.reload();
        });
      }

      //Store other person's ID when using ng-click
      $scope.storeId = function(uid){
        $localStorage.otherId = uid;
        console.log("the other person's ID is: " + uid);
        $state.go('other');
      };

      //GET MY INTEREST AND STORE IT IN ARRAY FORMAT
      $scope.myInterest = "";
      var refCurrentUserId = firebase.database().ref("users/" + currentUser.uid);
      refCurrentUserId.once('value').then(function(snapshot){

        //GET THE STRING OF THE CURRENT USER'S INTEREST
        var interestStr = snapshot.val().interest;
        $scope.myInterest = interestStr.split(",");
        $scope.myInterest.splice(-1);
        console.log($scope.myInterest);
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


               //IF SOMEONE ACTUALLY HAS A COMMON INTEREST, THEN PUSH THEM TO USER LIST
               if ($scope.commonInterest.length > 0){
                   UserList.push([user, $scope.commonInterest]);
               }

            }
          }

          //HANDLE CASE WHEN USER HAS NO COMMON INTEREST WITH ANYONE IN THE DATABASE
          if (UserList.length === 0){
            $scope.nomatch = 1;
            $state.go("match");

          }

          //GENERATE A RANDOM MATCH FOR THE USER
          $scope.randomMatch = function(){
            var numberOfPeople = Object.keys(UserTable).length;
            var randomUser = "";
            do{
              var randomNum = Math.floor((Math.random() * numberOfPeople-1)+1);
              randomUser = Object.keys(UserTable)[randomNum];
            }
            while(randomUser == currentUser.uid);
            $scope.randomName = UserTable[randomUser].name;
            $scope.randomPic = UserTable[randomUser].pictureUrl;
            $scope.randomID = randomUser;
            $scope.showPicture = 1;
            $state.go("match");

          };


          //SORTING THE USER LIST (UID, COMMON INTEREST) AND RETURN THE LENGTH
          UserList.sort(function(a,b){
            return b[1].length - a[1].length;
          });


        //STORE EVERYTHNG IN $SCOPE.PEOPLE FOR DISPLAY
        //$Scope.people: contains user objects with properties: name, uid, commonInterest
        $scope.people = [];
        var avatar;
        $scope.index=0;
        refUser.once('value', function(refSnap){
          var UserTable2 = refSnap.val();
          for (var k = 0; k < UserList.length; k++){
            var obj = {
              uid: UserList[k][0],
              name: UserTable2[UserList[k][0]].name,
              commonInterest: UserList[k][1],
              pictureUrl: UserTable2[UserList[k][0]].pictureUrl
            };
            $scope.people.push(obj);
          }
          console.log($scope.people);
          $state.go('match');
        });
        refUser.once('value', function(snapshot){
          $scope.people.forEach(function(people){
            avatar = document.getElementById("img-"+$scope.index);
            console.log(avatar);
            $scope.index++;
            // avatar.src=people.pictureUrl;
          $state.go('match');
          });
        });
      });
}]);
