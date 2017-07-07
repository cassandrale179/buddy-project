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

})

.state('match',{
  name: 'Match',
  url: '/matchPage',
    templateUrl: 'templates/match.html',
    controller: 'matchPageCtrl'
})

.state('interest',{
  name: 'Interest',
  url: '/interestPage',
    templateUrl: 'templates/interest.html',
    controller: 'interestPageCtrl'

})

.state('settings',{
  name: 'Settings',
  url: '/settingsPage',
    templateUrl: 'templates/settings.html',
    controller: 'settingsPageCtrl'
})

.state('message',{
  name: 'Message',
  url: '/messagePage',
    templateUrl: 'templates/message.html',
    controller: 'messagePageCtrl'
})

.state('resources',{
  name: 'Resources',
  url: '/resourcesPage',
    templateUrl: 'templates/resources.html',
    controller: 'resourcesPageCtrl'
})

.state('hotlines',{
  name: 'Hotlines',
  url: '/hotlinesPage',
    templateUrl: 'templates/resources/hotlines.html',
    controller: 'hotlinesPageCtrl'
});

$urlRouterProvider.otherwise('/loginPage');

});
