'use strict';

define([
  'angular',
  'jquery',
  'shared/js/hrt.js',
  'shared/setup_modal/setup_modal'
], function (angular) {

  angular.module('demoControllersModule', [
    'angular-storage',
    'setupModalModule'
    ])
  .controller('demoController', [
    '$scope', 
    'store',
    'setupModal',
  function(
    $scope, store, setupModal) {
    $scope.message = "connecting...";
    $scope.setup = function() {
      setupModal().then(function() {
        var hrtData = store.get('hrt-data');
        if (!hrtData) {
          $scope.message = "Was unable to connect to the hues";
        } else {
          $scope.userName = hrtData.userName;
          $scope.bridge = hrtData.bridge;
          $scope.lights = hrtData.lights;

          setBridge($scope.bridge);
          setUsername($scope.userName);
          setLights($scope.lights);
          $scope.message = "Successfully established connection to the hues";
        }
      });
    }

    if (!store.get('hrt-data')) {
      $scope.setup();
    } else {
      var hrtData = store.get('hrt-data');
      $scope.userName = hrtData.userName;
      $scope.bridge = hrtData.bridge;
      $scope.lights = hrtData.lights;

      setBridge($scope.bridge);
      setUsername($scope.userName);
      setLights($scope.lights);
      $scope.message = "Successfully established connection to the hues";
    }

    $('#hrt-player').on('play',function(){
      for (var i = 0; i < lightids.length; i++) {
        setTransitionTime(lightids[i], 1);
      }
      hrtInterval = setInterval(updateHrtFrame, 33);
    });

    $('#hrt-player').on('pause',function(){
      // set transition time back to default
      for (var i = 0; i < lightids.length; i++) {
        setTransitionTime(lightids[i], 4);
      }
      clearInterval(hrtInterval)
    });
    $.get('components/demo_page/hrt/demo.hrt', function(data) {
      parsehrt(new Blob([data], {type : 'text/html'}));
    });

  }])

});
