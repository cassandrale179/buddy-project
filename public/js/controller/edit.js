//--------------------  CONTROLLER FOR THE REGISTER PAGE --------------------
app.controller('editPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    else{
      userRef = firebase.database().ref("users/" + currentUser.uid);
      userRef.once("value", function(snapshot){
        $scope.description = snapshot.val().description;
        $state.go("edit");
      });



      $scope.updateBio = function(){
        userRef.update({
          description: $scope.description
        });
        $state.go("profile");
      };
    }
  }
]);
