'use strict';

define([
  'angular',
  'jquery',
  'shared/js/hrt.js',
  'shared/js/generate_hrt.js',
  'shared/js/color-thief.js',
  'shared/setup_modal/setup_modal'
], function (angular) {

  angular.module('createControllersModule', [
    'angular-storage',
    'setupModalModule'
    ])
  .controller('createController', [
    '$scope', 
    '$http',
    'store',
    'setupModal',
  function(
    $scope, $http, store, setupModal) {

    $scope.connectionEstablished = false;

    $scope.processVideo = function() {
      var player = $('#vidprocessor')[0];
      var hrtPlayer = $('#hrt-player')[0];
      var newVid = $('#newvid')[0];
      if (newVid.files.length < 1) {
        $scope.message = "Please select a video file to process";
        return;
      }
      var vidFile = newVid.files[0];
      var fileURL = URL.createObjectURL(vidFile);
      player.pause();
      player.setAttribute('src', fileURL);
      player.load();
      player.muted = true;
      player.play();
      $scope.message = "Processing video ...";

      hrtPlayer.pause();
      hrtPlayer.setAttribute('src', fileURL);
      hrtPlayer.load();
    }

    $scope.setup = function() {
      $scope.message = "connecting...";
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
          initPrevValues();
          getOriginalLightColor($scope.lights);
          $scope.connectionEstablished = true;
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
          on: true,
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
        initPrevValues();
        getOriginalLightColor($scope.lights);
        $scope.connectionEstablished = true;
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
      if (lightids.length > 0) {
        ga('send', 'event', 'auto-vid', 'play');
      }
    });

    function resetLights() {
      // set transition time back to default
      for (var i = 0; i < lightids.length; i++) {
        setTransitionTime(lightids[i], 4);
      }
      if ($scope.lights) {
        setOriginalLightColor($scope.lights);
      }
      clearInterval(hrtInterval);
    }

    $('#hrt-player').on('pause',resetLights);

    $(window).on('beforeunload', resetLights);

    $('#vidprocessor').on('loadedmetadata', function() {
      hrtText = '';
    });

    $('#vidprocessor').on('play', function() {
      hrtProcessInterval = setInterval(processVideoHRT, 100);
    });

    $('#vidprocessor').on('ended',function(){
      clearInterval(hrtProcessInterval);
      parsehrt(new Blob([hrtText], {type : 'text/html'}));
      console.log(hrtText);
      $scope.$apply(function() {
        $scope.message = "Processing complete! Play the video to test the result!";
        $scope.hrtReady = true;
      })
    });

  }])

});
