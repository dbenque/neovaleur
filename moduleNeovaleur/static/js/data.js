app.controller('DataCtrl', ['$scope', 'ciServices', function($scope, ciServices) {


  $scope.completedSections = {}
  $scope.progress = 0

  $scope.$on('optionSelected', function(event, ciid) {
    $scope.completedSections[ciid] = true

    $scope.progress = Math.floor(Object.keys($scope.completedSections).length * 100 / $scope.cimodel.root.OptCount)
  })



  ciServices.getModel().then(function(data) {
    // request was successful
    $scope.cimodel = data;
  }, function() {
    // request failed (same as your 'return false')
    $scope.cimodel = undefined;
  });

  $scope.savedata = function() {
    ciServices.savedata()
  }

  $scope.loaddata = function() {
    ciServices.loaddata()
  }


}]);


app.controller('ListOfOptions', ['$scope', '$http', 'ciServices', function($scope, $http, ciServices) {

  $scope.selectedOption = undefined
  $scope.completedSections = {}
  $scope.completion = "0"

  // Function to activate on version on click.
  $scope.selectOption = function(value, ciid) {

    //don't do anything if the version is already active one
    if (value == $scope.activeOption) {
      return
    }

    $scope.selectedOption = value
    ciServices.setSelectedOption(value, ciid)

    $scope.$emit('optionSelected', ciid)
  }

  $scope.$on('optionSelected', function(event, ciid) {
    $scope.completedSections[ciid] = true
    $scope.completion = Object.keys($scope.completedSections).length
  })

  // Function that will be call each time we suspect that the active option as changed
  $scope.refreshSelectedOption = function() {
    $scope.selectedOption = ciServices.getSelectedOption($scope.c.Ciid)
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
