'use strict';

define([
  'angular',
  'jquery',
  'angular-jwt',
  'angular-storage',
  'angular-ui-route',
  'components/create_page/create',
  'components/demo_page/demo',
  'components/whatis_page/whatis'
], function(angular, angularRoute) {
  // Declare app level module which depends on views, and components
  var app = angular.module('hrtApp', [
    'ui.router',
    'angular-jwt',
    'demoControllersModule',
    'createControllersModule',
    'whatisControllersModule',
    'angular-storage',
  ])
  .config(function(
      $stateProvider, 
      $urlRouterProvider, 
      $httpProvider) {
    $urlRouterProvider.otherwise("/whatis");

    $stateProvider
      // route for the browse page
      .state('whatis', {
        url: '/whatis',
        templateUrl : 'components/whatis_page/whatis.html',
        controller  : 'whatisController'
      })

      // route for the about page
      .state('demo', {
        url: '/demo',
        templateUrl : 'components/demo_page/demo.html',
        controller  : 'demoController'
      })

      // route for the contact page
      .state('create', {
        url: '/create',
        templateUrl : 'components/create_page/create.html',
        controller  : 'createController'
      })
  });

  return app;
});
