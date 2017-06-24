angular.module('app.routes', ['ui.router'])


.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider

.state('login',{
  name: 'Log In',
  url: '/loginPage',
    templateUrl: 'templates/login.html',
    controller: 'loginPageCtrl'
})

.state('register', {
  name: 'Register',
  url: '/registerPage',
    templateUrl: 'templates/register.html',
    controller: 'registerPageCtrl'
})

.state('forgot', {
  name: 'Forgot',
  url: '/forgotPage',
    templateUrl: 'templates/forgot.html',
    controller: 'forgotPageCtrl'
})

.state('profile',{
  name: 'Profile',
  url: '/profilePage',
    templateUrl: 'templates/profile.html',
    controller: 'profilePageCtrl'

});

$urlRouterProvider.otherwise('/loginPage');

});
