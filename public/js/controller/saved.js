app.controller('savedPageCtrl', ['$scope', '$state', '$localStorage',
  function($scope, $state, $localStorage){
    var currentUser = firebase.auth().currentUser;
    if (currentUser === null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }
    else{
      $scope.buddiesArr = [];
      var matchRef = firebase.database().ref("match/" + currentUser.uid);
      matchRef.once('value', function(snapshot){
        matchTable = snapshot.val();
        for (var user in matchTable){
          $scope.buddiesArr.push(user);
        }
      });

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
