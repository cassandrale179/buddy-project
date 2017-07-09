//----------------------------  FACTORY FOR THE MESSAGE PAGE -----------------------------------
app.factory('Message', ['$firebaseArray',
  function($firebaseArray) {
  var messageRef = firebase.database().ref('messages');
  // var convo = $firebaseArray(convoRef);
  var convo;
  var matchRef;
  var convoRef;
  var convoId;
  var uid1;
  var uid2;


  var Message =
  {
    create: function (msg) {
      return convo.$add(msg);
    },
    delete: function (msg) {
      return convo.$remove(msg);
    },

    //
    getConvoId: function(database, userId1, userId2) {
      matchRef1 = firebase.database().ref('match/'+ userId1 + "/" + userId2);
      matchRef2 = firebase.database().ref('match/'+ userId2+ "/" + userId1);

      console.log("Current database convoID:" + database.convoId);

      //IF CONVO ID EXIST, OUTPUT IT. ELSE CREATE NEW ONE
      if (database.convoId!==undefined){
        convoId = database.convoId;
        console.log("Already has a convo Id" + convoId);
      }
      else{
        var newRef = messageRef.push();
        convoId = newRef.key;
        console.log("These guys don't have a convoID, so now their convo ID is: " + convoId);
      }

      //CREATE A CONVO ID UNDER THE MESSAGE TABLE
      convoRef = messageRef.child(convoId);
      convo = $firebaseArray(convoRef);
      var conversation = {
        convoId: convoId //convoID: XOsksjdsjdad
      };

      //PUT THESE CONVO ID UNDER BOTH USER MATCH TABLE
      matchRef1.update(conversation);
      matchRef2.update(conversation);
      console.log("Convo id:"+ convoId);
      return convo;
    },

    //RETURN THE CONVO ID
    returnConvoId: convoId,

    //SET THE USER ID FOR BOTH PARTICIPANTS
    setUid: function(userId1, userId2){
      uid1 = userId1;
      uid2 = userId2;
    },
    returnUid1: function() {
      return uid1;
    },
    returnUid2: function() {
      return uid2;
    }
  };
  return Message;
}]);

//----------------------------  CONTROLLER FOR THE MESSAGE PAGE -----------------------------------
app.controller('messagePageCtrl', ['$scope', '$state', 'Message', '$firebaseArray', '$localStorage',
  function ($scope, $state, Message, $firebaseArray, $localStorage){

    //-----IF USER IS NULL, SIGN THEM BACK IN AND GET THEIR UID-----
      var user = firebase.auth().currentUser;
      if (user===null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
          $state.reload();
        });
      }
      var uid1 = user.uid;

      //-----ROOT REFERENCE-----
      var rootRef = firebase.database().ref();
      rootRef.once("value", function(snapshot)
      {

        //GET ID OF THE USER'S BUDDY
        var userDatabase = snapshot.child("users/" + uid1).val();
        var uid2 = userDatabase.buddy;
        Message.setUid(uid1, uid2);

        //CHECK THE ID OF THE TWO PEOPLE IN THE CONVERSATION
        console.log("now log the 2 IDs of the two people in a chat");
        console.log("uid1: " + Message.returnUid1());
        console.log("uid2: " + Message.returnUid2());

        //GET REFERENCE TO BOTH USER MATCH TABLE TO STORE CONVO ID
        var userMatchRef1 = firebase.database().ref('match/'+uid1+"/"+uid2);
        var userMatchRef2 = firebase.database().ref('match/'+uid2+"/"+uid1);

        //OUTPUT THE MESSAGE IN CONVO SCOPE ARRAY
        var matchDatabase = snapshot.child("match/" + uid1 + "/" + uid2).val();
        $scope.convo = Message.getConvoId(matchDatabase, uid1, uid2);

        //----- CHANGE COLOR OF THE TEXT DEPENDING ON THE ID OF THE PERSON -----
        $scope.setColor = function(message){
          var style1 = {
            "margin-right": "5%",
            "margin-left": "25%",
            "text-align": "right",
            "padding-right": "5%",
            "background-color": "#34495E",
            "color": "white",
            "margin-top": "20px",
          };

          var style2 = {
            "margin-right": "25%",
            "margin-left": "5%",
            "text-align": "left",
            "padding-left": "5%",
            "background-color": "white",
            "color": "#34495E",
            "margin-top": "20px"
          };


          if (message.sender == uid1) return style1;
          if (message.sender == uid2) return style2;
        };

        //----- WHEN USER CLICK INSERT, THEIR UID AND TIME OF MESSAGE ARE TAKEN -----
        $scope.insert = function(message)
        {

          //GET THE TIMESTAMP OF THE TEXT
          var dateTime = Date.now();
          var timestamp = Math.floor(dateTime/1000);
          var date = new Date(timestamp*1000);
          var hours = date.getHours();
          var minutes = "0" + date.getMinutes();
          var formattedTime = hours + ":" + minutes.substr(-2);
          $scope.newmessage.formattedTime = formattedTime;
          $scope.newmessage.timestamp = timestamp;

          //GET THE SENDER AND RECEIVER UID
          $scope.newmessage.sender = uid1;
          $scope.newmessage.receiver = uid2;

          //CREATE THE OBJECT MESSAGE
          Message.create(message);
        };
    });
}]);
