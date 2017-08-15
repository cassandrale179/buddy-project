//--------------------  CONTROLLER FOR THE INTEREST PAGE ---------------------------
app.controller('interestPageCtrl', ['$scope', '$state', '$localStorage',
  function($scope, $state, $localStorage){

    //SIGN IN USER AUTOMATICALLY
    var user = firebase.auth().currentUser;
    if (user===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    if (user !== null)
  {
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

            //ADD THEIR INTEREST AS A STRING IN THE USER TABLE
            refUserId.once('value', function(snapshot){
              var info = snapshot.val().age;
              var interestStr = info.interest;
              if (!info.Interest){
                interestStr="";
              }
              for (var k = 0; k< $scope.interestArr.length; k++){
                interestStr+=$scope.interestArr[k] + ',';
              }
              refUserId.update({interest: interestStr});
              console.log(interestStr);

              //ADD THEIR INTEREST TO THE INTERESTS TABLE
              for (var i = 0; i<$scope.interestArr.length;i++){
                var currentInterest = $scope.interestArr[i];
                var ref = firebase.database().ref("interests/"+currentInterest+"/" +user.uid);
                ref.set(info);
              }
            });

            $state.go('match');
          };
        }
      });
    }
  }
]);
