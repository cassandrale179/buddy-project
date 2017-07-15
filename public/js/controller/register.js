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
          description: "Edit your bio",
          interest: "",
          buddy: "",
          pictureUrl: "http://www.quran-institute.org/wp-content/uploads/2017/01/default-profile-bfeeabd02c3b38305b18e4c2345fd54dbbd1a0a7bf403a31f08fca4fada50449.png"
        };
        $localStorage.email = $scope.txtEmail;
        $localStorage.password = $scope.txtPassword;
        ref.child(user.uid).set(info);
        user.sendEmailVerification().then(function() {
          console.log(user);
          }, function(error) {
          });

        $state.go('interest');
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
