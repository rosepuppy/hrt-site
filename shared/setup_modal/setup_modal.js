'use strict';

define([
  'angular',
  'jquery',
  'ngDialog',
  'underscore'
], function (angular) {

  var setupModal = angular.module('setupModalModule', [
    'angular-storage',
    'ngDialog'
  ]);

  setupModal.service('setupModal', function ($rootScope, ngDialog, store) {
    function saveSetupData (data) {
      if ( data.value == '$escape'
        || data.value == '$closeButton'
        || data.value == '$document')
        return;
      store.set('hrt-data', data.value);
    }

    return function() {
      var instance = ngDialog.open({
        template: 'shared/setup_modal/setup_modal.html',
        className: 'ngdialog-theme-default',
        closeByDocument: false,
        controller: 'SetupModalCtrl'
      })

      return instance.closePromise.then(saveSetupData);
    };
  })
  .controller('SetupModalCtrl', function ($scope, $http) {
    $scope.selectBridge = function(bridge) {
      $scope.bridge = bridge;
      $scope.error = "";
      $scope.step = 1;
      $scope.description = "Press the link button on your bridge, then click connect to complete the connection!";
    }

    $scope.connectBridge = function() {
      $scope.userName = Math.random().toString(36).slice(2);

      var url = 'http://' + $scope.bridge.internalipaddress + '/api';

      $http({
        method: 'POST',
        url: url,
        data: {
          'devicetype': 'hrt',
          'username' : $scope.userName
        }
      }).success(function(data) {
        if (data[0].error) {
          $scope.error = data[0].error.description;
        } else if (data[0].success) {
          $scope.step = 2;
          $scope.error = "";
          var url = 'http://' + $scope.bridge.internalipaddress + '/api/' + $scope.userName + '/lights';
          $http.get(url).success( function(data) {
            if (_.size(data) > 0) {
              $scope.lightIndex = 0;
              $scope.lights = Object.keys(data);

              $scope.description = "Light #" + $scope.lights[$scope.lightIndex] + " is alerted. Is this light in your room?";
              var url = 'http://' + $scope.bridge.internalipaddress + '/api/' + $scope.userName + '/lights/' + $scope.lights[$scope.lightIndex] + '/state';
              $http.put(url, {'alert': 'lselect'});
            } else {
              $scope.description = "No lights detected!";
            }
          })
        }
      });
    }

    $scope.lightsInRoom = [];
    $scope.selectLight = function(isInRoom, light, index) {
      if (isInRoom) {
        $scope.lightsInRoom.push($scope.lights[$scope.lightIndex]);
      }
      var url = 'http://' + $scope.bridge.internalipaddress + '/api/' + $scope.userName + '/lights/' + $scope.lights[$scope.lightIndex] + '/state';
      $http.put(url, {'alert': 'none'});

      $scope.lightIndex = $scope.lightIndex + 1;
      if ($scope.lightIndex < $scope.lights.length) {
        $scope.description = "Light #" + $scope.lights[$scope.lightIndex] + " is alerted. Is this light in your room?";
        var url = 'http://' + $scope.bridge.internalipaddress + '/api/' + $scope.userName + '/lights/' + $scope.lights[$scope.lightIndex] + '/state';
        $http.put(url, {'alert': 'lselect'});
      } else {
        $scope.closeThisDialog({
          bridge: $scope.bridge.internalipaddress,
          userName: $scope.userName,
          lights: $scope.lightsInRoom
        });
      }
    }

    $http.get('https://www.meethue.com/api/nupnp').success(function(data) {
      if (data.length > 1) {
        $scope.error = "";
        $scope.step = 0;
        $scope.bridges = data;
        $scope.description = "Select your bridge";
      } else if (data.length == 1) {
        $scope.bridge = data[0];
        $scope.step = 1;
        $scope.description = "Press the link button on your bridge, then click connect to complete the connection!";
      } else {
        $scope.description = "No bridge detected!";
      }
    });
  });

});
