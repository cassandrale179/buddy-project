angular.module('app.routes', ['ui.router'])


.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider

.state('login',{
  name: 'Log In',
  url: '/loginPage',
    templateUrl: 'templates/login.html',
    controller: 'loginPageCtrl'
})

.state('profile',{
  name: 'Profile',
  url: '/profilePage',
    templateUrl: 'templates/profile.html',
    controller: 'profilePageCtrl'
});

$urlRouterProvider.otherwise('/loginPage');

});
