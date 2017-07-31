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

      //----------Create a count property in each interest-------------
      //Count: how many users like this interest
      refInterest.once("value", function(interestSnapshot){
        interestSnapshot.forEach(function(interest) {
          var count = interest.numChildren() - 1; //Returns how many users like this interest
          interest.ref.update({count: count});
        })
      })


      refInterest.orderByChild("count").on('child_added', function(snapshot){
        var interest = snapshot.val();
        interest.name = snapshot.key;
        console.log("Name of this interest: " + interest.name);
        $scope.interestData.unshift(interest);
      });



    }
  }
]);
