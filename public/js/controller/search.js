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


      refInterest.orderByChild("count").on('child_added', function(snapshot){
        var interest = snapshot.val();
        $scope.interestData.unshift(interest);
        console.log(interest);
        // angular.forEach(data, function(inter){
        //     var interest = {
        //       count : inter.count,
        //       match : inter.match,
        //       name : inter.name
        //     }
        //     console.log(interest);
        //     $scope.interestData.push(interest);
        // });
        // for (i=0;i<data.size();i++){

        // }

        console.log($scope.interestData);
      });
        // console.log($scope.interestData);


    }
  }
]);
