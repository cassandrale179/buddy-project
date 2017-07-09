app.controller('listPageCtrl', ['$scope', '$state', '$firebaseArray', '$localStorage', 'Message',
 function($scope, $state, $firebaseArray, $localStorage, Message){
   var currentUser = firebase.auth().currentUser;
   if (currentUser===null){
     firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){

       $state.reload();
     });
   }
   else{
     var uid1 = currentUser.uid;

     var rootRef = firebase.database().ref();
     var userMatchesRef = firebase.database().ref('match/'+uid1);
     //Get array of user matches
     $scope.userMatchesArray = $firebaseArray(userMatchesRef);
     //Get the names of the user matches
     rootRef.once("value", function(snapshot){
       var userDatabase = snapshot.child('users/').val();
       $scope.userMatchesArray.$loaded()
         .then(function() {
           angular.forEach($scope.userMatchesArray, function(match){
            var uid = match.$id;
            match.name=userDatabase[uid].name;
           });
         });
         //Store ID of the 2nd person in the Message object
      $scope.storeInfo = function(uid2){
        Message.setUid(uid1,uid2);
        $state.go('message');
      };


     });
   }


  // rootRef.once("value", function(snapshot){
  //   var userMatches = snapshot.child('matches/'+uid1);
  //
  // });



}]);
