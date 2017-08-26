app.controller('listPageCtrl', ['$scope', '$state', '$firebaseArray', '$localStorage', 'Message', '$q',
 function($scope, $state, $firebaseArray, $localStorage, Message, $q){
   var currentUser = firebase.auth().currentUser;
   if (currentUser===null){
     firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){

       $state.reload();
     });
   }
   else{


     $scope.imgSrc = "https://firebasestorage.googleapis.com/v0/b/buddy-be3d7.appspot.com/o/Avatars%2FODOYM3uPvBgkClDq9a1p0dsh1r52%2Favatar.jpg?alt=media&token=dc079964-b972-41eb-895c-dbb6716c00e8";
     var uid1 = currentUser.uid;
     //Store conversation to get last text
     var convoArrayRef;
     var convoArray;

     var rootRef = firebase.database().ref();
     var userMatchesRef = firebase.database().ref('match/'+uid1);

     //Get array of user matches sorted by most recent message
     $scope.userMatchesArray = [];
     userMatchesRef.orderByChild("lastTimestamp").on("child_added", function(snapshot){
       var match = snapshot.val();
       match.id = snapshot.key;
       $scope.userMatchesArray.unshift(match);
     })
     console.log($scope.userMatchesArray);
    //
    //  $scope.userMatchesArray = $firebaseArray(userMatchesRef);

     //GET CURRENT TIMESTAMP OF TODAY
     var dateTime = Date.now();
     var todayTimestamp = Math.floor(dateTime/1000);

     //Get the names of the user matches
     rootRef.once("value", function(snapshot){
       var userDatabase = snapshot.child('users').val();
       var convoId;
       var avatar;
       //index of picture
       $scope.index = 0;
         $scope.userMatchesArray.forEach(function(match)
         {
           console.log(match);
            var uid = match.id;
            match.name=userDatabase[uid].name;
            match.pictureUrl = userDatabase[uid].pictureUrl;
            //If last text exists, match is no longer considered new
            if (match.lastText){
              match.newMatch = "";
            }

            //Get time of last text in conversation, and how much time has passed

            match.timePassed = todayTimestamp - match.lastTimestamp ;

            //Create "days ago" timestamp
            if (match.timePassed<60){
              match.lastDate = match.timePassed + " seconds ago";
            }
            else if (match.timePassed<3600){
              match.lastDate = Math.floor(match.timePassed/60) + " minutes ago";
            }
            else if (match.timePassed<86400){
              match.lastDate = Math.floor(match.timePassed/3600) + " hours ago";
            }
            else {
              match.lastDate = match.lastDate;
            }

            //If there are unread messages, readStatus="unread", if none readStatus="read"
            console.log(match.readStatus);
            $scope.checkReadStatus = function(match) {
              if (match.readStatus=="unread"){
                var bold = {
                  "font-weight": "bold"
                };
                console.log("bold founded");
                return bold;
              }
            }

            console.log("This chat's convo ID is: " + match.convoId);

        $state.go('list');

         });


      });



         //Store ID of the 2nd person in the Message object
      $scope.storeInfo = function(uid2){
        Message.setUid(uid1,uid2);
        console.log("Uid 1 is: " + uid1);
        console.log("Uid 2 is: " + uid2);
        $state.go('message');
      };


    //  });
   }


  // rootRef.once("value", function(snapshot){
  //   var userMatches = snapshot.child('matches/'+uid1);
  //
  // });



}]);
