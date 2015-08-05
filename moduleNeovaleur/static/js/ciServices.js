app.service('ciServices', ['$q', '$rootScope', '$http', '$localStorage', function($q, $rootScope, $http, $localStorage) {

  var cimodel = {};
  cimodel.selectedOptions = {}

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

    getSelectedOption: function(ciid) {
      if (ciid in cimodel.selectedOptions) {
        return cimodel.selectedOptions[ciid];
      }
      return undefined
    },

    setSelectedOption: function(value, ciid) {
      cimodel.selectedOptions[ciid] = value
    },

    loaddata: function() {
      cimodel.selectedOptions = $localStorage.selectedOptions
    },

    savedata: function() {
      $localStorage.selectedOptions = cimodel.selectedOptions
    }

  }
}]);
