app.controller('profilePageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){

    $scope.show = 1;

    //SIGN USER IN AUTOMATICALLY WITH EMAIL AND PASSWORD ON PROFILE PAGE
    var user = firebase.auth().currentUser;
    if (user===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    //DECLARING SOME VARIABLES
    if (user !== null)
  {
      var id = user.uid;
      var ref = firebase.database().ref("users/" + id);
      var storageRef = firebase.storage().ref("Avatars/"+id+"/avatar.jpg");
      var profilePic = document.getElementById("profilePic");
      storageRef.getDownloadURL().then(function(url){
        if(url){profilePic.src=url;}
      });

      //THIS ALLOW THE USER TO UPLOAD THEIR PROFILE PIC
      $scope.uploadFile = function(event){
        var file = event.target.files[0];

        storageRef.put(file).then(function(snapshot){
          console.log("File uploaded!");
          storageRef.getDownloadURL().then(function(url)
          {
            profilePic.src = url;

          });
        });

      };

      // DISPLAY THE USER INTEREST AND BIO
      ref.once('value').then(function(snapshot){
        $scope.name = snapshot.val().name;
        $scope.age = snapshot.val().age;
        $scope.gender = snapshot.val().gender;
        $scope.description = snapshot.val().description;
        var interestStr = snapshot.val().interest;
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('profile');
      });

  }
}]);
