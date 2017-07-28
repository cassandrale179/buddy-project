app.controller('loginPageCtrl', ['$scope', '$state', '$localStorage', '$sessionStorage',
    function($scope, $state, $localStorage, $sessionStorage){

      //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
      var currentUser = firebase.auth().currentUser;
      if (currentUser===null){
        firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
          $state.reload();
        });
      }


      //SEARCHING THE FIREBASE TABLE AND MATCH PEOPLE WITH THEM
      var currentUserInterestArr = [];
      var dataRef = firebase.database().ref("users");
      dataRef.once('value').then(function(snapshot){

        //GET THE USER'S INTEREST STRNG AND SPLIT IT INTO AN ARRAY
        var UserTable = snapshot.val();
        console.log(UserTable); 
      });
}]);
