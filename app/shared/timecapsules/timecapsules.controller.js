(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('timecapsulesController', timecapsulesController);

	// Inject services to the Controller
	timecapsulesController.$inject = ["Auth","$scope","$state","Navigation","Util","Data","Query","Compare","MessageService","PopupService","ErrorHandler","TimecapsulesFactory"];
	
	// Controller Logic
	function timecapsulesController(Auth, $scope, $state, Navigation, Util, Data, Query, Compare, MessageService, PopupService, ErrorHandler, TimecapsulesFactory)
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
        
        
        
        $scope.show = function(timecapsule,index)
        {
            $scope.item = timecapsule;
            $scope.item.index = index;
            
        }
        
        
        
        $scope.loadTimeCapsule = function()
        {  
            $scope.query.name = $scope.item.name;
            $scope.query.description = $scope.item.description;
            
            $scope.query.criteria =  $scope.item.query.criteria;
            $scope.query.select =  $scope.item.query.select;
            $scope.query.from =  $scope.item.query.from;
            $scope.query.filters =  $scope.item.query.filters;
            $scope.query.results =  $scope.item.query.results;
            $scope.query.condensed  = $scope.item.query.condensed;
            $scope.query.visualizations  = $scope.item.query.visualizations;
            
            $scope.query.references =  $scope.item.query.references;
            $scope.query.variants =  $scope.item.query.variants;
            $scope.query.sources =  $scope.item.query.sources;
            $scope.query.pPlants =  $scope.item.query.pPlants;
            $scope.query.pDrugs =  $scope.item.query.pDrugs;
            
            $scope.compare.queries = $scope.item.compare.queries;
            
            
            
            $scope.toggleTimecapsules();
        }
        
        
        $scope.getTimeCapsules = function()
		 {  
			 TimecapsulesFactory.GetAll($scope.auth.user.id).then(function(result)
			 {   
                if(!result.error)
                {   
			        $scope.data.timecapsules = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
		  }
        
        $scope.toggleTimecapsules = function()
        { 
             $scope.display = !$scope.display;
        }
        
        
        
        $scope.showDeletePopup = function()
        {
             $scope.message.clear(); 
            
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'delete.popup.html',$scope);
         }
        
        
        $scope.delete = function()
         {  
             $scope.isLoading = true;
             
             TimecapsulesFactory.Delete($scope.auth.user.id, $scope.item._id.$id).then(function(result)
			 {  
                $scope.isLoading = false;
                
                if(!result.error)
                {   
                    
                    $scope.data.timecapsules.splice($scope.item.index,1);
                    $scope.item = null;
                    $scope.popup.dialog.close();
                    $scope.message.text.success = "Time Capsule Succesfully Deleted!";
                }
                else
                {
                    $scope.message.text.error = result.message;
                    ErrorHandler.handleErrorCode(result.code);
                    $scope.popup.dialog.close();
                }
			 });  
         }
        
        
        
        $scope.init = function()
        {    
            $scope.getTimeCapsules();
               
        }
        
        $scope.init();
         
        
		 
	}
	

})();

