var app = angular.module('StarterApp', ['ngMaterial']);

app.controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){

	$scope.myvar = "David"
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

	$.getJSON("model.json", function(modeljson) {

		modelroot = modeljson["1"]
		$scope.$apply(function() { $scope.myvar = modelroot.Content })
		console.log(modelroot.Content); // this will show the info it in firebug console
	});



}]);
