app.controller('searchPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    var user = firebase.auth().currentUser;
    if (user===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }
  }
]);
