app.controller('searchPageCtrl', ['$scope', '$state', '$localStorage', '$firebaseArray',
  function ($scope, $state, $localStorage, $firebaseArray)
  {
    $scope.interestData = [];

    //IF USER HASN'T LOGGED IN YET, THEN LOG THEM IN
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    else{
      var count;
      var refInterest = firebase.database().ref("interests/");


      refInterest.orderByChild("count").on('child_added', function(data){
        console.log(data);
        // console.log(table);
        // for (var inter in table){
        //   var interest = {
        //     count : table[inter].count,
        //     name : inter
        //   }
        //   $scope.interestData.push(interest);
        // }
        //
        // console.log($scope.interestData);
      });


    }
  }
]);
