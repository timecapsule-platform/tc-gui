(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('navigationBarController', navigationBarController);

	// Inject services to the Controller
	navigationBarController.$inject = ["$scope","Navigation"];
	
	// Controller Logic
	function navigationBarController($scope,Navigation)
	{
		
		$scope.navPages = Navigation.navBar;
        
        $scope.$watch(function () { return Navigation.navBar },function()
        {
            $scope.navPages = Navigation.navBar;
        });
        
       
	}
	

})();

