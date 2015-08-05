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


app.controller('DataCtrl', ['$scope', 'ciModelService', function($scope, ciModelService) {

  ciModelService.getModel().then(function(data) {
    // request was successful
    $scope.cimodel = data;
  }, function() {
    // request failed (same as your 'return false')
    $scope.node = undefined;
  });

  $scope.optionClicked = function($event, ciid, val) {

    // remove highlight on all other element
    angular.forEach(angular.element($event.target).parent().children(), function(elm, key) {
      angular.element(elm).removeClass("list-group-item-info")
    })

    // highlight the clicked element
    angular.element($event.currentTarget).addClass("list-group-item-info")


  }

  $scope.alloptions = {};


}]);

app.service('ciModelService', ['$q', '$rootScope', '$http', function($q, $rootScope, $http) {

  var cimodel = {};

  return {
    getModel: function() {

      var deferred = $q.defer();
      if (cimodel.loaded) {
        deferred.resolve(cimodel);
      } else {
        $.getJSON("rootmodel.json", function(modeljson) {

          cimodel.root = modeljson
          cimodel.loaded = true
          deferred.resolve(cimodel);

          $rootScope.$$phase || $rootScope.$apply();
          // scope.$apply(function() {
          //   scope.cimodel = cimodel
          // })

        });
      }
      return deferred.promise;
    },

    getLeaves: function() {
      var deferred = $q.defer();
      if (cimodel.leavesLoaded) {
        deferred.resolve(cimodel.leaves);
      } else {
        $.getJSON("leaves.json", function(leavesjson) {

          cimodel.leaves = leavesjson
          cimodel.leavesLoaded = true
          deferred.resolve(cimodel.leaves);

          $rootScope.$$phase || $rootScope.$apply();
          // scope.$apply(function() {
          //   scope.cimodel = cimodel
          // })

        });
      }
      return deferred.promise;

    },
    getSelectedOption: function() {
      return 10;
    }


  }
}]);

app.controller('ListOfOptions', ['$scope', '$http', 'ciModelService', function($scope, $http, ciModelService) {

  //Active version for the POD associated to that list of version
  $scope.selectedOption = ""

  // Function to activate on version on click.
  $scope.selectOption = function(value, ciid) {

    //don't do anything if the version is already active one
    if (value == $scope.activeOption) {
      return
    }

    // TODO call server!!!

    // acs.activateVersion(podtype, version).
    // success(function(data) {
    //   $scope.refreshActiveVersion()
    // })

    $scope.selectedOption = value


  }

  // Function that will be call each time we suspect that the active option as changed
  $scope.refreshSelectedOption = function() {
    $scope.selectedOption = ciModelService.getSelectedOption($scope.c.Ciid)
  }

  //call once to initialization
  $scope.refreshSelectedOption()



}]).directive('ciidoption', ['$http', function($http) {

  function link(scope, element, attrs) {

    // The watch is also triggered at first display when value is initialized
    scope.$watch("selectedOption", function(newValue, oldValue) {
      // element.empty()
      // element.text(attrs.version);
      if (newValue == attrs.optionvalue) {
        // var spannode = document.createElement("span");
        // spannode.setAttribute("class", "badge");
        // spannode.textContent = "activated";
        // element.append(spannode);
        //element.addClass("list-group-item-info")
        element.addClass("active")
      } else {
        //element.removeClass("list-group-item-info")
        element.removeClass("active")

      }
    })
  }

  return {
    link: link
  };

}])
