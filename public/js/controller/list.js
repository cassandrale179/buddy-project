app.controller('messageListCtrl', ['$scope', '$state', '$firebaseArray', '$localStorage',
 function($scope, $state, $firebaseArray, $localStorage){
   var currentUser = firebase.auth().currentUser;
   if (currentUser===null){
     firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){

       $state.reload();
     });
   }
  var uid1 = currentUser.uid;

  var rootRef = firebase.database().ref();
  var userMatchesRef = firebase.database().ref('match/'+uid1);
  //Get array of user matches
  $scope.userMatchesArray = $firebaseArray(userMatchesRef);
  //Get the names of the user matches
  var userMatchesName = [];
  rootRef.once("value", function(snapshot){
    var userDatabase = snapshot.child('users');
    for (var i = 0; i<userMatchesArray.length;i++){
      //Get ID of the person
      var uid = userMatchesArray[i].$id;
      
    }
  });

  // rootRef.once("value", function(snapshot){
  //   var userMatches = snapshot.child('matches/'+uid1);
  //
  // });



}]);
