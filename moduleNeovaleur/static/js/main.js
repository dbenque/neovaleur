/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('ciui', [
  'ngRoute', 'ngStorage'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  // Home
    .when("/", {
      templateUrl: "partials/home.html",
      controller: "PageCtrl"
    })
    // Pages
    .when("/faq", {
      templateUrl: "partials/faq.html",
      controller: "PageCtrl"
    })
    .when("/data", {
      templateUrl: "partials/data.html",
      controller: "DataCtrl"
    })
    // else 404
    .otherwise("/404", {
      templateUrl: "partials/404.html",
      controller: "PageCtrl"
    });
}]);

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function( /* $scope, $location, $http */ ) {
  console.log("Page Controller reporting for duty.");
});
