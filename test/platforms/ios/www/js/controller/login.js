//------------------------------  CONTROLLER FOR THE LOGIN PAGE --------------------
app.controller('loginPageCtrl', ['$scope', '$state', '$localStorage', '$sessionStorage',
    function($scope, $state, $localStorage, $sessionStorage){
      //Redirect page if user already logged in
      $scope.init = function() {
        //IF LOCAL STORAGE ALREADY EXIST, THEN LOGIN AUTOMATICALLY
        if ($localStorage.email && $localStorage.password)
        {
          firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
          $state.go('profile');
        }
      };


      //LOGGING USER IN
      $scope.LogUser = function() {
        $scope.errorMessage = "";
        var saveUserInfo = function() {
          $localStorage.email = $scope.txtEmail;
          $localStorage.password = $scope.txtPassword;

        };

          //IF LOCAL STORAGE ALREADY EXIST, THEN LOGIN AUTOMATICALLY
          if ($localStorage.email && $localStorage.password)
          {
            firebase.auth().signInWithEmailAndPassword($localStorage.email, $localStorage.password);
            $state.go('profile');
          }

          //ELSE FORCE THE USER TO SIGN IN WITH PASSWORD AND EMAIL
          else{
          firebase.auth().signInWithEmailAndPassword($scope.txtEmail, $scope.txtPassword)
          .then(function(resolve){
              console.log("loginPageCtrl: Logged in!");
              saveUserInfo();
              console.log("Email: " + $localStorage.email);
              console.log("password: " + $localStorage.password);
              $state.go('profile');
          })

          //------------CATCH THE ERROR HERE--------
          .catch(function(error){
            if (error.code == 'auth/wrong-password'){
              $scope.errorMessage = "Incorrect password or user don't have a password";
            }
            if (error.code == 'auth/user-not-found'){
              $scope.errorMessage = "User does not exist in database";
            }
            if (error.code == 'auth/user-disabled'){
              $scope.errorMessage = "This account has been disabled";
            }
            if (error.code == 'auth/invalid-email'){
              $scope.errorMessage = "Email is not valid.";
            }
            console.log(error);
            $state.go('login');
          });
        }
        };
}]);
