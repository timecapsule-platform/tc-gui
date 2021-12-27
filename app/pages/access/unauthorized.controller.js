(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('unauthorizedController', unauthorizedController);

	// Inject services to the Controller
	unauthorizedController.$inject = ["$scope","Auth","$state","Navigation"];
  
    function unauthorizedController($scope,Auth,$state,Navigation)
    {
        
        
        
        
        $scope.initNavigation = function()
         {
             Navigation.navBarClear();
             Navigation.navBarPush({name:"Unauthorized Access",link:"unauthorized",current:true});
         }
        
        $scope.init = function()
        {
            Auth.checkLogin();
            $scope.initNavigation();
            console.log("das");
        }
        
        $scope.init();
    }
    
})();

