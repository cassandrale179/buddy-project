app.controller('savedPageCtrl', ['$scope', '$state', '$localStorage',
  function($scope, $state, $localStorage){
    var currentUser = firebase.auth().currentUser;
    if (currentUser === null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }
    else{
      //SWIPE TRANSITION
      $scope.transitionRight = function() {
        $state.go('buddies');
      }
      $scope.transitionLeft = function() {
        $state.go('profile');
      }

      //-------- STORE OTHER PEOPLE ID WHEN CLICKED ON IT ----------------
      $scope.storeId = function(uid){
        $localStorage.otherId = uid;
        console.log("the other person's ID is: " + uid);
        $state.go('other');
      };

      //----------------CHECK IF A USER HAVE FRIENDS OR NOT----------------

      $scope.buddiesArr = [];
      var matchRef = firebase.database().ref("match/" + currentUser.uid);
      matchRef.once('value', function(snapshot){
        matchTable = snapshot.val();
        for (var user in matchTable){
          $scope.buddiesArr.push(user);
        }
        if ($scope.buddiesArr.length === 0){
          $scope.nofriends = 1;
        }
      });

      //-------- DISPLAY ALL THE FRIENDS THAT THE USER CURRENTLY HAVE--------
      $scope.buddiesInfo = [];
      var userRef = firebase.database().ref("users");
      userRef.once('value', function(snapshot){
        userTable = snapshot.val();
        for (var i = 0; i < $scope.buddiesArr.length; i++){
          var object = {
            uid: $scope.buddiesArr[i],
            name: userTable[$scope.buddiesArr[i]].name,
            pictureUrl: userTable[$scope.buddiesArr[i]].pictureUrl
          };
          $scope.buddiesInfo.push(object);
        }
        console.log("Saved buddies", $scope.buddiesInfo);
        $state.go('saved');
      });

    }
}]);
