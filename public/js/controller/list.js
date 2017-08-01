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
     //Get array of user matches
     $scope.userMatchesArray = $firebaseArray(userMatchesRef);

     //Get the names of the user matches
     rootRef.once("value", function(snapshot){
       var userDatabase = snapshot.child('users').val();
       var matchDatabase = snapshot.child('match').val();
       var convoDatabase = snapshot.child('messages').val();
       var convoId;
       var uidArray = [];
       var avatar;
       //index of picture
       $scope.index = 0;

       $scope.userMatchesArray.$loaded()
         .then(function(){
           console.log($scope.userMatchesArray);
           $scope.userMatchesArray.forEach(function(match)
           {
               //$id is ID of other person
              var uid = match.$id;
              uidArray.push(uid);
              match.name=userDatabase[uid].name;
              //Get convo ID
              match.convoId = matchDatabase[uid1][uid].convoId;
              match.lastText = matchDatabase[uid1][uid].lastText;
              match.pictureUrl = userDatabase[uid].pictureUrl;
              console.log(match.pictureUrl);
              avatar = document.getElementById("img-"+$scope.index);
              $scope.index++;
              console.log("Avatar" + avatar); 
              avatar.src = match.pictureUrl;

              console.log("This chat's convo ID is: " + match.convoId);




        });


          $state.go('list');
            console.log(uidArray);

           });


        });



         //Store ID of the 2nd person in the Message object
      $scope.storeInfo = function(uid2){
        Message.setUid(uid1,uid2);
        console.log("UId 1 is: " + uid1);
        console.log("Uid 2 is: " + uid2);
        $state.go('message');
      };


    //  });
   }



}]);
