'use strict';

require.config({
  paths: {
    'jquery': 'bower_components/jquery/dist/jquery',
    'angular': 'bower_components/angular/angular',
    'angular-route': 'bower_components/angular-route/angular-route',
    'angular-ui-route': 'bower_components/angular-ui-router/release/angular-ui-router',
    'angular-animate': 'bower_components/angular-animate/angular-animate',
    'angular-resource': 'bower_components/angular-resource/angular-resource',
    'angular-storage': 'bower_components/a0-angular-storage/dist/angular-storage',
    'angular-jwt': 'bower_components/angular-jwt/dist/angular-jwt',
    'underscore': 'bower_components/underscore/underscore',
    'ngDialog': 'bower_components/ngDialog/js/ngDialog'
  },
  shim: { 
    'underscore': {'exports': '_'},
    'jquery': {'exports': '$'},
    'angular' : {'exports' : 'angular'},
    'angular-resource': ['angular'],
    'angular-route': ['angular'],
    'angular-jwt': ['angular'],
    'angular-storage': ["angular"],
    'angular-ui-route': ['angular']
  },
});

require([
  'angular',
  'app'
  ], function(angular, app) {
    var $html = angular.element(document.getElementsByTagName('html')[0]);
    angular.element().ready(function() {
      // bootstrap the app manually
      angular.bootstrap(document, ['hrtApp']);
    });
  }
);