'use strict';

define([
  'angular',
], function (angular) {

  angular.module('whatisControllersModule', [
    ])
  .controller('whatisController', [
    '$scope', 
  function(
    $scope) {
    $scope.text = "whatis";
  }])

});
