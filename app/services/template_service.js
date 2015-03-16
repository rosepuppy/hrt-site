'use strict';

define([
  'angular',
  './constants',
  'angular-resource'
], function (angular, constants) {
  var artworkServices = angular.module('artworkServicesModule', ['ngResource']);

  artworkServices.factory('artworkServices', ['$resource',
    function($resource){
      return $resource(constants.service_base_url + 'artwork/:artworkId', {}, {
        query: {method:'GET', params:{artworkId:''}, isArray:true}
      });
    }]);

});
