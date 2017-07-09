//--------------------  CONTROLLER FOR THE INTEREST PAGE ---------------------------
app.controller('interestPageCtrl', ['$scope', '$state',
  function($scope, $state){

    //CREATE SOME VARIABLES
    var user = firebase.auth().currentUser;
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
        };

        //WHEN USER SUBMIT THEIR INTERESTS
        $scope.CaptureInterest = function(){

          //ADD THEIR INTEREST TO THE INTERESTS TABLE
          var interestTable = snapshot.val();
          for (var i = 0; i < $scope.interestArr.length; i++){
            var info = {
              count: 0,
              match: 0
            };
            refInterest.child($scope.interestArr[i]).set(info);
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

          $state.go('match');
        };
      }
    });
  }
]); 
