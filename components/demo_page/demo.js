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
    '$http',
    'store',
    'setupModal',
  function(
    $scope, $http, store, setupModal) {
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
          getOriginalLightColor($scope.lights);
          $scope.message = "Successfully established connection to the hues";
        }
      });
    }

    function getOriginalLightColor(lights) {
      var url = 'http://' + curBridge + '/api/' + username + '/lights/';
      $scope.lightStates = {}

      $http.get(url).success(function(data) {
        for (var i = 0; i < lights.length; i++) {
          $scope.lightStates[lights[i]] = data[lights[i]].state;
        }
      });
    }

    function setOriginalLightColor(lights) {
      for (var i = 0; i < lights.length; i++) {
        var state = $scope.lightStates[lights[i]];
        var url = 'http://' + curBridge + '/api/' + username + '/lights/' + lights[i] + '/state';
        $http.put(url, {
          on: state.on,
          bri: state.bri,
          hue: state.hue,
          sat: state.sat
        }).success(function(data) {
          if (data[0].error) {
            console.log('unable to set light '+ lights[i]+' back');
          }
        })
      }
    }

    if (!store.get('hrt-data')) {
      $scope.setup();
    } else {
      var hrtData = store.get('hrt-data');
      $scope.userName = hrtData.userName;
      $scope.bridge = hrtData.bridge;
      $scope.lights = hrtData.lights;

      var url = 'http://' + $scope.bridge + '/api/' + $scope.userName + '/config';
      $http.get(url, {timeout: 3000}).success(function(data) {
        setBridge($scope.bridge);
        setUsername($scope.userName);
        setLights($scope.lights);
        getOriginalLightColor($scope.lights);
        $scope.message = "Successfully established connection to the hues";
      })
      .error(function() {
        store.remove('hrt-data');
        $scope.setup();
      });
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
      setOriginalLightColor($scope.lights);
      clearInterval(hrtInterval)
    });
    $.get('components/demo_page/hrt/demo.hrt', function(data) {
      parsehrt(new Blob([data], {type : 'text/html'}));
    });

  }])

});
