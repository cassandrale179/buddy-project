//-------------------  CONTROLLER FOR OTHER PEOPLE PROFILE PAGE ------------------------
app.controller('otherPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    var currentUser = firebase.auth().currentUser;
    if (currentUser===null){
      firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password).then(function(){
        $state.reload();
      });
    }

    var userRef = firebase.database().ref("users/" + currentUser.uid);
    userRef.once('value', function(snapshot){
      var buddyID = snapshot.val().buddy;
      var buddyRef = firebase.database().ref("users/" + buddyID);
      buddyRef.once('value', function(buddySnap){
        $scope.buddyName = buddySnap.val().name;
        $scope.buddyAge = buddySnap.val().age;
        $scope.buddyGender = buddySnap.val().gender;
        $scope.buddyDescription = buddySnap.val().description;
        $scope.buddyArr = buddySnap.val().interest.split(",");
        $scope.buddyArr.splice(-1);
        var buddyProfilePic = document.getElementById("buddyProfilePic");
        var storageRef = firebase.storage().ref("Avatars/"+buddyID+"/avatar.jpg");
        storageRef.getDownloadURL().then(function(url){
          buddyProfilePic.src=url;
        });
        $state.go('other');
      });
    });
 }]);
