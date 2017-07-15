app.controller('searchPageCtrl', ['$scope', '$state', '$localStorage', '$firebaseArray',
  function ($scope, $state, $localStorage, $firebaseArray)
  {
    $scope.nameData = [];
    $scope.emailData = [];

    //IF USER HASN'T LOGGED IN YET, THEN LOG THEM IN
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    else{
      var refUser = firebase.database().ref("users");
      refUser.once('value', function(snapshot){
        var table = snapshot.val();
        for (var user in table){
          $scope.nameData.push(table[user].name);
          $scope.emailData.push(table[user].email);
        }
        console.log($scope.nameData);
        console.log($scope.emailData);
      });


    }
  }
]);
