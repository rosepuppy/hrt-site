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

    if (!store.get('hrt-data')) {
      setupModal().then(function() {
        if (!store.get('hrt-data')) {
          $scope.message = "Was unable successfully connect to the hues";
        } else {
          $scope.message = "Successfully established connection to the hues";
        }
      });
    } else {
      $scope.message = "Successfully established connection to the hues";
    }

    $('#hrt-player').on('play',function(){
      for (var i = 0; i < numSources; i++) {
        setTransitionTime(i, 1);
      }
      hrtInterval = setInterval(updateHrtFrame, 33);
    });

    $('#hrt-player').on('pause',function(){
      clearInterval(hrtInterval)
    });
    $.get('components/demo_page/hrt/demo.hrt', function(data) {
      parsehrt(new Blob([data], {type : 'text/html'}));
    });

  }])

});
