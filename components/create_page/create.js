'use strict';

define([
  'angular',
], function (angular) {

  angular.module('createControllersModule', [
    ])
  .controller('createController', [
    '$scope', 
  function(
    $scope) {
    $scope.text = "create";

  }])

});
