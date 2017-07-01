angular.module('firebaseConfig', ['firebase'])

.run(function(){

    var config = {
      apiKey: "AIzaSyBGwFeduKU7ByLH9BZJoy5FqM1QCsw0Ba0",
      authDomain: "buddy-be3d7.firebaseapp.com",
      databaseURL: "https://buddy-be3d7.firebaseio.com",
      projectId: "buddy-be3d7",
      storageBucket: "buddy-be3d7.appspot.com",
      messagingSenderId: "13947405698"
  };
  firebase.initializeApp(config);

});
