angular.module('app.routes', ['ui.router'])


.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider

.state('login',{
  name: 'Log In',
  url: '/loginPage',
    templateUrl: 'templates/login.html',
    controller: 'loginPageCtrl'
})

.state('portal',{
  name: 'Portal',
  url: '/portalPage',
    templateUrl: 'templates/portal.html',
    controller: 'portalPageCtrl'
});

$urlRouterProvider.otherwise('/loginPage');

});
