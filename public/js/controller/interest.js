//--------------------  CONTROLLER FOR THE INTEREST PAGE ---------------------------
app.factory('CountInterest', ['$firebaseObject',
function($firebaseObject) {
  var currentUser = firebase.auth().currentUser;
  var uid = currentUser.uid;
  var userRef = firebase.database().ref('users/'+uid);
  var arrLength;
  userRef.once('value', function(snapshot) {
    var strInterest = snapshot.val().interest;
    if (!strInterest) arrLength = 0;
    else {
      var interestArr = strInterest.split(',');
      arrLength = interestArr.length-1;
      console.log("Users currently has " + arrLength + "interests");
    }
  })
  var CountInterest =
  {
    setArrLength: function (len) {
      arrLength = len;
    },
    getArrLength: function() {
      return arrLength;
    },
    decreaseArrLength: function() {
      arrLength--;
    }
  }
  return CountInterest;
}]);
app.controller('interestPageCtrl', ['$scope', '$state', '$localStorage', 'CountInterest',
  function($scope, $state, $localStorage, CountInterest){

    //CREATE SOME VARIABLES
    var user = firebase.auth().currentUser;
    if (!user){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
    }

    console.log($localStorage.email);
    console.log($localStorage.password);

    var id = user.uid;
    var refUserId = firebase.database().ref("users/"+id);
    var refInterest = firebase.database().ref("interests");
    $scope.errorMessage = "";

    //GET THE CURRENT USER INTEREST
    refUserId.once('value', function(snapshot){
      var interestStr = snapshot.val().interest;
      if (interestStr === null) $scope.interestArr = {};
      else{
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('interest');
      }
    });


    refInterest.once('value', function(snapshot)
  {
      if (user !== null)
      {
        //WHEN USER ADD AN INTEREST
        $scope.AddMore = function(){

          //REMOVE ALL CAPITAL LETTERS AND SPACES
          $scope.interest = $scope.interest.toLowerCase();
          $scope.interest = $scope.interest.replace(/\s/g, '');

          //ONLY ADDING IF THE INTEREST IS NOT A DUPLICATE
          if (!$scope.interest){
            $scope.errorMessage = "Please input an interest";
            return;}
          if ($scope.interestArr.indexOf($scope.interest) == -1){
            $scope.interestArr.push($scope.interest);
            $scope.interest = null;
          }
          else{
            $scope.errorMessage = "You already added this interest";
          }

        };

        //WHEN USER REMOVES AN INTEREST
        $scope.Remove = function(x){
          $scope.interestArr.splice(x, 1);
          CountInterest.decreaseArrLength();

        };

        //WHEN USER SUBMIT THEIR INTERESTS
        $scope.CaptureInterest = function(){

          //ADD THEIR INTEREST TO THE INTERESTS TABLE
          var interestTable = snapshot.val();
          var counter = 0; //Count how many users has added this interest
          for (var i = CountInterest.getArrLength(); i < $scope.interestArr.length; i++){

            //Get how many users have this interest
            var currentInterest = $scope.interestArr[i];
            if (snapshot.hasChild(currentInterest)){
              var currentInterestTable = snapshot.child(currentInterest).val();
              counter = currentInterestTable.count;
              console.log("Current counter: " + counter);
              counter++;
            }
            else {
              var info =
              {
                count : 1,
                match : 0,
                name : currentInterest
              }
              refInterest.child(currentInterest).set(info);
            }

            console.log("Counter for the interest " + currentInterest + "is: " + counter);

            var info = {
              count: counter++
            };
            refInterest.child($scope.interestArr[i]).update(info);
          }

          //ADD THEIR INTEREST AS A STRING IN THE USER TABLE
          refUserId.once('value', function(snapshot){
            var obj = snapshot.val();
            var interestStr = obj.interest;
            if (!obj.Interest){
              interestStr="";
            }
            for (var k = 0; k< $scope.interestArr.length; k++){
              interestStr+=$scope.interestArr[k] + ',';
            }
            refUserId.update({interest: interestStr});
            console.log(interestStr);
          });
          CountInterest.setArrLength($scope.interestArr.length);

          $state.go('prematch');
        };
      }
    });
  }
]);
