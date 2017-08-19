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

.state('buddies',{
  name: 'Buddies',
  url: '/buddiesPage',
    templateUrl: 'templates/buddies.html',
    controller: 'buddiesPageCtrl'
})


.state('match',{
  name: 'Match',
  url: '/matchPage',
    templateUrl: 'templates/match.html',
    controller: 'matchPageCtrl'
})

.state('saved',{
  name: 'Saved',
  url: '/savedPage',
    templateUrl: 'templates/saved.html',
    controller: 'savedPageCtrl'
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

.state('other',{
  name: 'Other',
  url: '/otherPage',
    templateUrl: 'templates/other.html',
    controller: 'otherPageCtrl'
})

.state('list',{
  name: 'List',
  url: '/listPage',
    templateUrl: 'templates/list.html',
    controller: 'listPageCtrl'
})

.state('resources',{
  name: 'Resources',
  url: '/resourcesPage',
    templateUrl: 'templates/resources.html',
    controller: 'resourcesPageCtrl'
})

.state('edit',{
  name: 'Edit',
  url: '/editPage',
    templateUrl: 'templates/edit.html',
    controller: 'editPageCtrl'
});


$urlRouterProvider.otherwise('/loginPage');

});
