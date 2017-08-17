//--------------------  CONTROLLER FOR THE REGISTER PAGE --------------------
app.controller('registerPageCtrl', ['$scope', '$state', '$localStorage',
  function ($scope, $state, $localStorage){
    $scope.RegisterUser = function(){

      $scope.errorMessage = "";

      //------------CREATE A NEW USER------------
      firebase.auth().createUserWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
      .then(function(resolve){
        console.log("registerPageCtrl: Registered!");
        var ref = firebase.database().ref("users");
        var user = firebase.auth().currentUser;
        var info = {
          name: $scope.txtName,
          email: $scope.txtEmail,
          age: $scope.txtAge,
          gender: "NA",
          description: "Tap here to edit your bio",
          interest: "",
          buddy: "",
          pictureUrl: "https://firebasestorage.googleapis.com/v0/b/buddy-be3d7.appspot.com/o/default.png?alt=media&token=540dfe34-5559-4d2f-8e42-27258502ea01"
        };
        $localStorage.email = $scope.txtEmail;
        $localStorage.password = $scope.txtPassword;
        ref.child(user.uid).set(info);
        user.sendEmailVerification().then(function() {
          console.log(user);
          }, function(error) {
          });

        $state.go('buddies');
      })

      //------------CATCHING ERROR HERE------------
      .catch(function(error)
      {
        if (error.code == 'auth/weak-password') {
          $scope.errorMessage = "Password is weak.";
        }
        if (error.code == "auth/email-already-in-use"){
          $scope.errorMessage = "Email is already used by another account";
        }
        if (error.code == 'auth/invalid-email'){
          $scope.errorMessage = "Invalid email";
        }
        console.log(error);
        $state.go('register');
      });
    };
  }
]);
