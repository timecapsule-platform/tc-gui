(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('sourcesController', sourcesController);

	// Inject services to the Controller
	sourcesController.$inject = ["$scope","Global","$state","Auth","Navigation","Util","Data","PopupService","MessageService", "ErrorHandler","DataFactory","QueryFactory"];
	
	
	
	// Controller Logic
	function sourcesController($scope,Global,$state,Auth,Navigation,Util,Data,PopupService,MessageService, ErrorHandler,DataFactory,QueryFactory)
	{ 
         // Urls for the View
         $scope.url = 'app/pages/query-machine/';
         $scope.popupUrl = 'app/pages/query-machine/popup/'
         
         // Get the utility functions to this scope
         $scope.util = Util;
        
         // The popup service
         $scope.popup = PopupService;
        
         // The service to handle all messages
         $scope.message = MessageService;
         
         // The Data Factory
         $scope.data = Data;
        
         // All loading elements
         $scope.isLoading =
         {
             page: false,
             create: false,
             edit: false,
             delete: false
         };
         
         // Use this object as a model for CRUD data
         $scope.item = {};
         
         $scope.items = [];  
        
         $scope.sortOrder = "name";
          
         $scope.filters = 
         {
            role: "all",
            search: ""
         };
        
         $scope.source = null;
        
        
        
         /*********************  Watchers  *********************************/
        
        $scope.$watch(function () { return $scope.filters.search },function()
        {
            $scope.getSources();
        });
        
        
        
        $scope.isSelected = function(item)
        {   
            return ($scope.item && (item.name == $scope.item.name));
        }
        
        
        $scope.selectItem = function(item)
        {
            $scope.item = angular.copy(item);
            $scope.getSourceInfo(item.name);
              
        }
        
        
        /*********************  Popups  *********************************/
        
         
        
         
         /********************* CRUD actions *********************************/
         
        
        $scope.getSourceInfo = function(source)
        {     
  
             var sparql = "";
             
             sparql += 'SELECT ?name ?year ?language ?author ?description ?url  ';
             sparql += 'WHERE { ';
              
             sparql += '?source a ' + Global.ns + 'ReferenceSource. ';
             sparql += '?source ' + Global.ns + 'name ?name. ';
             sparql += '?source ' + Global.ns + 'name "'+source+'"^^xsd:string. ';
             
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'description ?description. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'url ?url. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'year ?year. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'language ?language. }. ';
             sparql += 'OPTIONAL { ?source ' + Global.ns + 'hasAuthor ?a. ?a ' + Global.ns + 'name ?author. }. ';
  
             sparql += ' } '; 
            
           
            $scope.isLoading.results = true;

            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                $scope.isLoading.results = false; 
               
                if(!result.error)
                {   
                     $scope.source = result.results.bindings[0];
                     $scope.getSourceAuthors(source);
                      
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
         }
        
        
        $scope.getSourceAuthors = function(source)
        {     
  
             $scope.authors = [];
            
             var sparql = "";
             
             sparql += 'SELECT DISTINCT ?author ';
             sparql += 'WHERE { ';
              
             sparql += '?source a ' + Global.ns + 'ReferenceSource. ';
             sparql += '?source ' + Global.ns + 'name ?name. ';
             sparql += '?source ' + Global.ns + 'name "'+source+'"^^xsd:string. ';
             
             sparql += '?source ' + Global.ns + 'hasAuthor ?a. ?a ' + Global.ns + 'name ?author.';
  
             sparql += ' } '; 
            
            
            $scope.isLoading.results = true;

            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                $scope.isLoading.results = false; 
                
                if(!result.error)
                {   
                     $scope.authors = result.results.bindings;
                      
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
         }
          
         
         /********************* Data Collectors  *********************************/
         
        $scope.getSources = function()
		 {  
			 DataFactory.GetSources($scope.filters.search).then(function(result)
			 {     console.log(result);
                if(!result.error)
                {   
			        $scope.items = result;
                    
                     
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
		  }
          
         
         /********************* Initialization *********************************/
		 
         $scope.initNavigation = function()
         {
             Navigation.setPage("sources");
             Navigation.navBarClear();
            
         }
         
         $scope.init = function()
         {
             Auth.checkLogin();
             Auth.Authorize("sources");
             $scope.initNavigation();
              
             $scope.getSources();
              
           
         }
         
         $scope.init();
		 
		 
	}
	

})();

