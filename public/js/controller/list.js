app.controller('listPageCtrl', ['$scope', '$state', '$firebaseArray', '$localStorage', 'Message', '$q',
 function($scope, $state, $firebaseArray, $localStorage, Message, $q){
   var currentUser = firebase.auth().currentUser;
   if (currentUser===null){
     firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){

       $state.reload();
     });
   }
   else{
     var uid1 = currentUser.uid;
     //Store conversation to get last text
     var convoArrayRef;
     var convoArray;

     var rootRef = firebase.database().ref();
     var userMatchesRef = firebase.database().ref('match/'+uid1);
     //Get array of user matches
     $scope.userMatchesArray = $firebaseArray(userMatchesRef);

     //Get the names of the user matches
     rootRef.once("value", function(snapshot){
       var userDatabase = snapshot.child('users').val();
       var matchDatabase = snapshot.child('match').val();
       var convoDatabase = snapshot.child('messages').val();
       var convoId;
       var promises = [];

       $scope.userMatchesArray.$loaded()
         .then(function() {
           angular.forEach($scope.userMatchesArray, function(match){
             //$id is ID of other person
            var uid = match.$id;
            match.name=userDatabase[uid].name;
            //Get convo ID
            match.convoId = matchDatabase[uid1][uid].convoId;
            match.lastText = matchDatabase[uid1][uid].lastText;
            console.log("This chat's convo ID is: " + match.convoId);

            });


           });

         });


         //Store ID of the 2nd person in the Message object
      $scope.storeInfo = function(uid2){
        Message.setUid(uid1,uid2);
        $state.go('message');
      };


    //  });
   }


  // rootRef.once("value", function(snapshot){
  //   var userMatches = snapshot.child('matches/'+uid1);
  //
  // });



}]);
