app.filter("emptyifblank", function(){
  return function(object, query) {
    if (!query){
      return {};
    }
    else {
      return object;
    }
  };
});

app.controller('buddiesPageCtrl', ['$scope', '$state', '$localStorage', '$firebaseArray',
  function ($scope, $state, $localStorage, $firebaseArray)
  {
    $scope.errorMessage = "";
    $scope.interestData = [];
    $scope.survey = 0;
    console.log($scope.survey);
    $scope.triggers = ["depression", "anorexia", "suicide", "bulimia", "obsessivecompulsivedisorder", "pospartum", "schizo", "socialanxiety", "bdd", "bed", "ocd", "adhd", "selfharm", "ptsd", "cutting", "anxiety", "trichotillomania", "orthorexia", "mentalillness", "personalitydisorder", "anorexianervosa", "antiosicaldisorder"]; 

    //IF USER HASN'T LOGGED IN YET, THEN LOG THEM IN
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }


    else{
      //SWIPE TRANSITION
      $scope.transitionRight = function() {
        $state.go('list');
      }
      $scope.transitionLeft = function() {
        $state.go('saved');
      }

      var refInterest = firebase.database().ref("interests/");
      var refUserId = firebase.database().ref("users/"+currentUser.uid);

      //----------GET THE CURRENT USER INTEREST----------
      refUserId.on('value', function(snapshot){
        var interestStr = snapshot.val().interest;
        if (interestStr === null) $scope.interestArr = {};
        else{
          $scope.interestArr = interestStr.split(",");
          $scope.interestArr.splice(-1);
          console.log("Current user's interest: " + $scope.interestArr);
          $state.go('buddies');
        }
      });


      //---------- RETURN HOW MANY USERS LIKE AN INTEREST ----------
      refInterest.on("value", function(interestSnapshot){
        interestSnapshot.forEach(function(interest) {
          var likes = interest.numChildren() - 1;
          interest.ref.update({count: likes});
        });
      });

        //---------- INTEREST WITH THE MOST LIKE WILL GO ON TOP----------
      refInterest.orderByChild("count").on('child_added', function(snapshot){
        var interest = snapshot.val();
        interest.name = snapshot.key;
        $scope.interestData.unshift(interest);
      });

      //----------- WHEN USER CLICK ADD AN INTEREST -----------------
      $scope.AutoFill = function(interest){
        // $scope.searchInterest = interest.name;
        if ($scope.interestArr.indexOf(interest.name) == -1){
          $scope.interestArr.push(interest.name);
          $scope.searchInterest = null;
          $scope.errorMessage = "";
        }
        else{
          $scope.errorMessage = "You already added this interest";
        }
      };

      //----------- WHEN USER MANUALLY TYPE AN INTEREST -----------------
      $scope.CaptureInterest = function(){
        if (!$scope.searchInterest){
          $scope.errorMessage = "Please input an interest";
          return;
        }

          //----------- IF USER ENTER A VALID INTEREST -----------------
        if ($scope.interestArr.indexOf($scope.searchInterest) == -1){
            $scope.searchInterest = $scope.searchInterest.toLowerCase().replace(/\s/g,'');

          //----------- IF THE INTEREST IS A TRIGGER ------------------
          if ($scope.triggers.indexOf($scope.searchInterest) != -1){
            $scope.survey = 1;
          }

          else{
            $scope.interestArr.push($scope.searchInterest);
            $scope.searchInterest = null;
            $scope.errorMessage = "";
          }
        }

          //----------- IF THE INTEREST IS ALREADY ADDED  ------------------
        else{
          $scope.errorMessage = "You already added this interest";
        }
      };

      //-------- WHEN USER WANT TO REMOVE AN INTEREST --------------
      $scope.Remove = function(x){
        $scope.interestArr.splice(x, 1);
      };


      //-------- WHEN USER CLICK SEARCH FOR BUDDIES --------------
      $scope.SubmitInterest = function(){

        //ADD THEIR INTEREST AS A STRING IN THE USER TABLE
        refUserId.on('value', function(snapshot){
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
            var ref = firebase.database().ref("interests/"+currentInterest+"/" +currentUser.uid);
            ref.set(info);
          }
            $state.go('match');
        });


      };
    }
  }
]);
