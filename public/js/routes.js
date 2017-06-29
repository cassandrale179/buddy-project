angular.module('app.routes', ['ui.router'])


.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider

.state('login',{
  name: 'Log In',
  url: '/loginPage',
    templateUrl: 'templates/login.html',
    controller: 'loginPageCtrl'
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

})

.state('interest',{
  name: 'Interest',
  url: '/interestPage',
    templateUrl: 'templates/interest.html',
    controller: 'interestPageCtrl'

})

.state('match',{
  name: 'Match',
  url: '/matchPage',
    templateUrl: 'templates/match.html',
    controller: 'matchPageCtrl'
})

.state('settings',{
  name: 'Settings',
  url: '/settingsPage',
    templateUrl: 'templates/settings.html',
    controller: 'settingsPageCtrl'
});

$urlRouterProvider.otherwise('/loginPage');

});
