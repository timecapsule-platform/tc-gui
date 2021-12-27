(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('appController', appController);

	// Inject services to the Controller
	appController.$inject = ["$scope","Auth","$state","Global","Navigation","Company","Data"];
	
	// Controller Logic
	function appController($scope,Auth,$state,Global,Navigation,Company,Data)
	{
		
        $scope.auth = Auth;
        $scope.baseURL = Global.baseURL;
        
        $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyAsxPhwdll7tyyidUz7VvPFda-tjOsSqYQ";
        
        $scope.helpDisplay = false;
        
      
        
        $scope.$watch(function () { return $scope.auth.login },function()
        { 
            if(!$scope.auth.login)
            {
                $state.go("login");
            }
        });
        
        $scope.$watch(function () { return $scope.auth.user },function()
        {   
            if($scope.auth.user)
            {
                Navigation.initMenu($scope.auth.user.role);
            }
        });
        
        $scope.isGuest = function()
        {
            return (Auth.user.role == "guest");
        }
        
        
        $scope.showHelp = function()
        { 
             $scope.helpDisplay = !$scope.helpDisplay;
        }
        
        
        $scope.logout = function()
        {
            $scope.auth.signOut().then(function(result)
             {  
                 $scope.auth.clearLogin();
                 $state.go("login");
 
        	 });
        }
         
		
        $scope.init = function()
        {    
            $scope.auth.checkLogin();
           
            if($scope.auth.login)
            {
                Data.init();
            }
            
        }
        
        $scope.init();
        
        
		 
	}
	

})();

