app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
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
      var userRef = firebase.database().ref('users/'+id);
      var ref = firebase.database().ref("users/" + id);
      var storageRef = firebase.storage().ref("Avatars/"+id+"/avatar.jpg");
      userRef.once("value", function(snapshot) {
        $scope.userProfilePic = snapshot.val().pictureUrl;
        console.log($scope.userProfilePic);
        $state.go('profile');
      });


      //THIS ALLOW THE USER TO UPLOAD THEIR PROFILE PIC
      $scope.uploadFile = function(event){
        var file = event.target.files[0];

        storageRef.put(file).then(function(snapshot){
          console.log("File uploaded!");
          storageRef.getDownloadURL().then(function(url)
          {
            $scope.userProfilePic = url;
            userRef.update({pictureUrl: url});
            $state.go('profile');

          });
        });

      };

      // DISPLAY THE USER INTEREST AND BIO
      ref.once('value').then(function(snapshot){
        $scope.name = snapshot.val().name;
        $scope.age = snapshot.val().age;
        $scope.description = snapshot.val().description;
        var interestStr = snapshot.val().interest;
        $scope.interestArr = interestStr.split(",");
        $scope.interestArr.splice(-1);
        $state.go('profile');
      });
      // $scope.updateBio = function($data) {
      //   ref.update({description: $data});
      // };

      $scope.updateBio = function(){

      }; 
  }
}]);
