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
      if (database.convoId){
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

      //ADD READ STATUS
      // convo.$loaded()
      //   .then(function() {
      //     angular.forEach(convo, function(msg){
      //       if (msg.sender=uid2){
      //         msg.read=true;
      //       }
      //       console.log(msg);
      //     })
      //   })
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
    },
    addReadStatus: function(matchRef) {
      // angular.forEach(convo, function(msg){
      //   if (msg.sender==uid2){
      //     msg.read=true;
      //     convo.$save(msg);
      //   }
      // })
      matchRef.update({
        readStatus: "read"
      });
    },
    countUnreadMessage: function(convo){
      angular.forEach(convo, function(msg){
        console.log(msg);
      });
    }
  };
  return Message;
}]);

//----------------------------  CONTROLLER FOR THE MESSAGE PAGE -----------------------------------
app.controller('messagePageCtrl', ['$scope', '$state', 'Message', '$firebaseArray', '$localStorage', '$anchorScroll', '$location',
  function ($scope, $state, Message, $firebaseArray, $localStorage, $anchorScroll, $location){


    //-----IF USER IS NULL, SIGN THEM BACK IN AND GET THEIR UID-----

      var user = firebase.auth().currentUser;
      if (user===null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){

          $state.reload();
        });
      }


      messageRef = firebase.database().ref('messages');


      var uid1 = user.uid;

      //-----ROOT REFERENCE-----
      var rootRef = firebase.database().ref();
      rootRef.once("value", function(snapshot)
      {



        //CHECK THE ID OF THE TWO PEOPLE IN THE CONVERSATION
        console.log("now log the 2 IDs of the two people in a chat");
        console.log("uid1: " + Message.returnUid1());
        console.log("uid2: " + Message.returnUid2());
        var uid2 = Message.returnUid2();

        //GET DETAILS OF OTHER PERSON
        var buddyData = snapshot.child("users/"+uid2).val();
        $scope.buddyPictureUrl = buddyData.pictureUrl;
        $scope.buddyName = buddyData.name;

        //GET REFERENCE TO BOTH USER MATCH TABLE TO STORE CONVO ID
        var userMatchRef1 = firebase.database().ref('match/'+uid1+"/"+uid2);
        var userMatchRef2 = firebase.database().ref('match/'+uid2+"/"+uid1);

        //OUTPUT THE MESSAGE IN CONVO SCOPE ARRAY
        var matchDatabase = snapshot.child("match/" + uid1 + "/" + uid2).val();
        $scope.convo = Message.getConvoId(matchDatabase, uid1, uid2);

        //ADD READ STATUS
        Message.addReadStatus(userMatchRef1);


        //AUTOMATICALLY SCROLL TO THE BOTTOM OF MESSAGE PAGE
        $location.hash('bottom');
        $anchorScroll();


        //----- CHANGE COLOR OF THE TEXT DEPENDING ON THE ID OF THE PERSON -----
        $scope.setColor = function(message){
          var style1 = {
            "margin-right": "5%",
            "margin-left": "25%",
            "text-align": "right",
            "padding-right": "5%",
            "background-color": "#4F62AD",
            "color": "white",
            "margin-top": "20px",
          };

          var style2 = {
            "margin-right": "25%",
            "margin-left": "5%",
            "text-align": "left",
            "padding-left": "5%",
            "background-color": "#7AB74D",
            "color": "white",
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

          //GET THE CURRENT DATE OF THE TEXT
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!

          if(dd<10){
              dd='0'+dd;
          }
          if(mm<10){
              mm='0'+mm;
          }
          message.date = mm+'/'+dd;

          //GET THE SENDER AND RECEIVER UID
          $scope.newmessage.sender = uid1;
          $scope.newmessage.receiver = uid2;

          //CREATE READ STATUS
          message.read = false;

          //CREATE THE OBJECT MESSAGE
          Message.create(message);

          //Update last text under match Databas for both users
          userMatchRef1.update(
            {
              lastText: message.text,
              lastFormattedTime: message.formattedTime,
              lastDate: message.date,
              lastTimestamp: message.timestamp
            }
          );
          userMatchRef2.update(
            {
            lastText: message.text,
            lastFormattedTime: message.formattedTime,
            lastDate: message.date,
            lastTimestamp: message.timestamp,
            readStatus: "unread"
          });

          $scope.newmessage.text = "";


        };


    });
}]);
