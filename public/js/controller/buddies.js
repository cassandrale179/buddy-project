app.filter("emptyifblank", function(){
  return function(object, query) {
    if (!query){
      return {};
    }
    else {
      return object;
    }
  };
});

app.controller('buddiesPageCtrl', ['$scope', '$state', '$localStorage', '$firebaseArray',
  function ($scope, $state, $localStorage, $firebaseArray)
  {
    $scope.errorMessage = "";
    $scope.interestData = [];

    //IF USER HASN'T LOGGED IN YET, THEN LOG THEM IN
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }


    else{
      var refInterest = firebase.database().ref("interests/");
      var refUserId = firebase.database().ref("users/"+currentUser.uid);

      //----------GET THE CURRENT USER INTEREST----------
      refUserId.once('value', function(snapshot){
        var interestStr = snapshot.val().interest;
        if (interestStr === null) $scope.interestArr = {};
        else{
          $scope.interestArr = interestStr.split(",");
          $scope.interestArr.splice(-1);
          console.log("Current user's interest: " + $scope.interestArr);
          $state.go('buddies');
        }
      });


      //---------- RETURN HOW MANY USERS LIKE AN INTEREST ----------
      refInterest.once("value", function(interestSnapshot){
        interestSnapshot.forEach(function(interest) {
          var likes = interest.numChildren() - 1;
          interest.ref.update({count: likes});
        });
      });

        //---------- INTEREST WITH THE MOST LIKE WILL GO ON TOP----------
      refInterest.orderByChild("count").on('child_added', function(snapshot){
        var interest = snapshot.val();
        interest.name = snapshot.key;
        $scope.interestData.unshift(interest);
      });

      //----------- WHEN USER CLICK ADD AN INTEREST -----------------
      $scope.CaptureInterest = function(){

        if (!$scope.searchInterest){
          $scope.errorMessage = "Please input an interest";
          return;}
        if ($scope.interestArr.indexOf($scope.searchInterest) == -1){
          $scope.interestArr.push($scope.searchInterest);
          $scope.searchInterest = null;
        }
        else{
          $scope.errorMessage = "You already added this interest";
        }

      };
    }
  }
]);
