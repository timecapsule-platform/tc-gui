(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('helpController', helpController);

	// Inject services to the Controller
	helpController.$inject = ["Auth","$scope","$state","Navigation","Util","Data","Query","Compare","MessageService","PopupService","ErrorHandler","TimecapsulesFactory"];
	
	// Controller Logic
	function helpController(Auth, $scope, $state, Navigation, Util, Data, Query, Compare, MessageService, PopupService, ErrorHandler, TimecapsulesFactory)
	{
		 
        $scope.query = Query;
        
        $scope.compare = Compare;
        
        $scope.data = Data;
        
        $scope.message = MessageService;
        $scope.popup = PopupService;
        
        $scope.auth = Auth;
        
        $scope.isLoading = false;
        
        $scope.display = false; 
        
        $scope.item = {}
        
        $scope.popupUrl = 'app/shared/timecapsules/popup/';
        
      
        
        
        $scope.init = function()
        {    
            
               
        }
        
        $scope.init();
         
        
		 
	}
	

})();

