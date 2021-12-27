(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('queryMachineController', queryMachineController);

	// Inject services to the Controller
	queryMachineController.$inject = ["$scope","$state","$window","Global","Auth","Navigation","Util","Data","PopupService","MessageService", "ErrorHandler","QueryFactory","QueryBuilder","Resource","Query","Compare","PlantsFactory","TimecapsulesFactory", "NgMap"];
	
	
	
	// Controller Logic
	function queryMachineController($scope, $state, $window, Global, Auth, Navigation, Util, Data, PopupService, MessageService, ErrorHandler, QueryFactory,QueryBuilder,Resource,Query,Compare,PlantsFactory,TimecapsulesFactory, NgMap)
	{ 
         // Urls for the View
         $scope.url = 'app/pages/query-machine/';
         $scope.popupUrl = 'app/pages/query-machine/popup/';
         $scope.resourceUrl = 'app/shared/resource/';
         
         // Get the utility functions to this scope
         $scope.util = Util;
        
         // The popup service
         $scope.popup = PopupService;
        
         // The service to handle all messages
         $scope.message = MessageService;
         
         // The Data Factory
         $scope.data = Data;
     
        // Init Auth
        $scope.auth = Auth;
        
         
         // All loading elements
         $scope.isLoading =
         {
             page: false,
             results: false,
             resource: false,
             delete: false
         };
          
         $scope.sortOrder = "name";
          
         $scope.filters = 
         {
            role: "all",
            fromSearch: "",
            plantsSearch: "",
            drugsSearch : "",
            languagesSearch: "",
            sourcesSearch: "",
            plantPartSearch: "",
            plantFamilySearch: "",
            filterSearch: ""
         };
        
        
        $scope.search = 
        {
            from: "",
            filter : ""
        }
        
         
        // The query to be formed
        $scope.query = Query;
         
         
        
        // The current results display type: Condensed / Redundant
        $scope.resultsView = "Redundant"; 
        
        // The current resource to display 
        $scope.resource = Resource;
        
        // The queries in the stack for comparison
        $scope.compare = Compare;
        
        
        
        // Map Markers
        $scope.markers = [];
        
        // Map Source Markers
        $scope.sourceMarkers = [];
       
        $scope.isMinimized = 
        {
            results : false
        };
        
        
         /*********************  Watchers  *********************************/
        
        $scope.$watch(function () { return $scope.search.from },function()
        {
              if($scope.query.from)
              {   
                  if($scope.query.from.name)
                  {
                      $scope.data.Get($scope.query.from.name, $scope.search.from);
                  }
              }
        });
        
        $scope.$watch(function () { return $scope.search.filter },function()
        {
              if($scope.query.currentFilter)
              {   
                  if($scope.query.currentFilter.name)
                  {
                      $scope.data.Get($scope.query.currentFilter.name, $scope.search.filter);
                  }
              }
        });
        
        $scope.$watch(function () { return $scope.query.markersReady },function()
        {   
            if($scope.query.markersReady && $scope.query.resultsTotal && $scope.query.resultsTotal.length)
            { 
                $scope.initMap();
            }
                  
        },true);
         
        
        
        /*********************  Other Business Logic  *********************************/  
        
        $scope.generateMarkers = function()
        {    
            for(var i=0;i<$scope.query.resultsTotal.length;i++)
            { 
                var markerIcon = "assets/images/marker-undefined.svg";

                if($scope.query.resultsTotal[i].type)
                {
                    if($scope.query.resultsTotal[i].type.value == "Grows")
                        markerIcon = "assets/images/marker-grows.svg";
                    else
                    if($scope.query.resultsTotal[i].type.value == "ArchaeologicalFinding")
                        markerIcon = "assets/images/marker-arcaeological.svg";
                    else
                    if($scope.query.resultsTotal[i].type.value == "Cargo")
                        markerIcon = "assets/images/marker-cargo.svg";
                }

                if($scope.query.resultsTotal[i].latitude && $scope.query.resultsTotal[i].longitude)
                { 
                  
                    $scope.markers[i] = new google.maps.Marker(
                    { 
                        title: "Uknown",
                        icon: markerIcon,
                        position: 
                        { 
                            lat: Number($scope.query.resultsTotal[i].latitude.value), 
                            lng: Number($scope.query.resultsTotal[i].longitude.value)
                        },
                        map: $scope.map
                     });
                }

                

            }
            console.log($scope.map);
         console.log($scope.markers);
            console.log($scope.query.resultsTotal);
        }
        
        
        
        
        $scope.initMap = function()
        {  
            console.log($scope.query.markers);
            console.log($scope.query.sourceMarkers);
            
             NgMap.getMap().then(function(map) 
             {  
                for(var i=0;i<$scope.query.markers.length;i++)
                {
                    $scope.query.markers[i].setMap(map);
                }
                 
                for(var i=0;i<$scope.query.sourceMarkers.length;i++)
                { 
                    $scope.query.sourceMarkers[i].setMap(map);
                }
                 
             });
        }
        
        $scope.setResultsView = function(value)
        {
            $scope.resultsView = value;
            console.log($scope.resultsView);
        }
        
        $scope.searchClear = function()
        {
            $scope.search.from = "";
            $scope.search.filter = "";
        }
        
        $scope.clearCompareQueries = function()
        {
            $scope.compare = [];
        }
        
        $scope.addQueryToCompare = function()
        {
           
            if(!$scope.query.results.length)
            {
                $scope.item = {};
                $scope.item.message = "The query has no results to compare!"
                $scope.popup.dialog = Util.showPopup($scope.popupUrl+'error.message.popup.html',$scope);
            }
            else
            {
                $scope.compare.queries.push(angular.copy($scope.query));
            }
                
        }
        
         
       /*********************  Query GUI Business Logic  *********************************/  
         
        $scope.isVisualization = function(vizName)
        { 
            for(var i=0;i<$scope.query.visualizations.length;i++)
            {
                if($scope.query.visualizations[i] == vizName)
                    return true;
            }
            
            return false;
        }
        
        $scope.queryAddCriteria= function(item)
        {  
            
                $scope.query.criteria = item;
                $scope.popup.dialog.close();
            
        }
        
        $scope.queryAddFilterDatePeriodData = function()
        {
            // Checks if the filter is already in the filters array (otherwise -1)
             var index = $scope.getfilterIndex();
             
             // if the filter is in the array just change data
             if(index != -1)
             {
                 $scope.query.currentFilter.data.name = $scope.data.datePeriod.min+" - "+$scope.data.datePeriod.max;
                 $scope.query.currentFilter.data.dateFrom = $scope.data.datePeriod.min+"-01-01";
                 $scope.query.currentFilter.data.dateTo = $scope.data.datePeriod.max+"-01-01";
                 $scope.query.currentFilter.data.yearFrom = parseInt($scope.data.datePeriod.min);
                 $scope.query.currentFilter.data.yearTo = parseInt($scope.data.datePeriod.max);
                 
             }
            else
            { 
                 $scope.query.currentFilter.data = {};
                 $scope.query.currentFilter.data.name = $scope.data.datePeriod.min+" - "+$scope.data.datePeriod.max;
                 $scope.query.currentFilter.data.dateFrom = $scope.data.datePeriod.min+"-01-01";
                 $scope.query.currentFilter.data.dateTo = $scope.data.datePeriod.max+"-01-01";
                 $scope.query.currentFilter.data.yearFrom = parseInt($scope.data.datePeriod.min);
                 $scope.query.currentFilter.data.yearTo = parseInt($scope.data.datePeriod.max);
                 $scope.query.filters.push($scope.query.currentFilter);
            }
             $scope.popup.dialog.close();
        }
        
        // Checks if the current filter already exists in the query filters array and returns index
        $scope.getfilterIndex = function()
        {    
            for(var i=0;i<$scope.query.filters.length;i++)
            {
                if($scope.query.currentFilter.name == $scope.query.filters[i].name)
                {
                    return i;
                }
            }
            
            return -1;
        }
        
        $scope.queryAddFilterData = function(data)
        {
             $scope.query.currentFilter.data = data;
             
             // Checks if the filter is already in the filters array (otherwise -1)
             var index = $scope.getfilterIndex();
             
             // if the filter is in the array just change data
             if(index != -1)
             {
                 $scope.query.filters[index].data = data;
             }
             // else push the new filter
             else
             {
                $scope.query.filters.push($scope.query.currentFilter);
             }
             
             $scope.popup.dialog.close();
        }
        
        $scope.querySelectFilter = function(item)
        {   
             $scope.query.currentFilter = item; 
        }
        
        
        
        $scope.queryAddFromData = function(data)
        {
            if($scope.query.from)
            {    
                $scope.query.from.data = data;
                $scope.query.state.criteria = true;
                $scope.popup.dialog.close();
            }
        }
        
        $scope.queryAddFrom = function(item)
        {
             
            $scope.query.from = item;
             
        }
        
        
        $scope.queryAddSelect = function(item)
        {
            
            $scope.query.Clear();

            $scope.query.select = item;
            $scope.query.fromOptions = item.from;
            $scope.query.state.from = true;

            //Also add the default criteria ("All")
            $scope.query.criteria =  $scope.query.options[0].criteria[0];

            $scope.popup.dialog.close();
            
            
        }
        
        
        
        $scope.isFilterDataSelected = function(item)
        {
            return ($scope.query.currentFilter && $scope.query.currentFilter.data && $scope.query.currentFilter.data.name == item.name);
        }
        
        $scope.isFromDataSelected = function(item)
        {
            return ($scope.query.from && $scope.query.from.data && $scope.query.from.data.name == item.name);
        }
        
        /*********************  Popups  *********************************/
        
     
        
        $scope.showResource = function(type,name,concept)
        {
             $scope.message.clear(); 
             $scope.resource.Get(type,name,concept);
           

             $scope.popup.resource = Util.showPopup($scope.resourceUrl+'resource.html',$scope);
         }
        
         
        $scope.showExportPopup = function(exportFormat)
        {     
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'export.popup.html',$scope);
        }
        
        $scope.showCompareQueriesPopup = function()
        {  
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'compare.queries.popup.html',$scope);
        }
        
        $scope.showComparePopup = function()
        {
              
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'compare.popup.html',$scope);
        }
        
        
        $scope.showCreateTimecapsulePopup = function()
        {
             $scope.item = {};
             $scope.item.query = angular.copy($scope.query);
             $scope.item.compare = angular.copy($scope.compare);
           
             $scope.item.userId = parseInt($scope.auth.user.id);  
             $scope.item.date_created = moment().format('dddd DD MMMM YYYY');
            
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'create.timecapsule.popup.html',$scope);
        }
        
        
        $scope.showQueryCriteriaPopup = function()
        {
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'query.criteria.popup.html',$scope);
        }
        
        $scope.showQueryFiltersPopup = function()
        {    
             $scope.message.clear(); 
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'query.filters.popup.html',$scope);
        }
        
        $scope.showQueryFromPopup = function()
        {
             $scope.message.clear(); 
             
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'query.from.popup.html',$scope);
        }
        
        $scope.showQuerySelectPopup = function()
        {
             $scope.message.clear(); 
             
             $scope.popup.dialog = Util.showPopup($scope.popupUrl+'query.select.popup.html',$scope);
        }
        
        
         
         /********************* CRUD actions *********************************/
         
        $scope.export = function(exportFormat)
        {      
             var format = "&format="+exportFormat;
             var url = Global.sparql+$scope.query.sparql+format;
              
             $window.open(url, '_blank');
        }
        
        $scope.createTimeCapsule = function()
        {    
                 $scope.isLoading.create = true;
             
                 TimecapsulesFactory.Create($scope.item).then(function(result)
                 {  
                    $scope.isLoading.create = false;
                     console.log(result);
                    if(!result.error)
                    {   
                        $scope.data.timecapsules.push(result);
                        $scope.message.text.success = "Time Capsule succesfully created!";
                    }
                    else
                    {
                        $scope.message.text.error = result.message;
                        ErrorHandler.handleErrorCode(result.code);
                    }
                 });
             
        }
          
         
        
        
         /********************* Data Collectors  *********************************/
         
        
       
          
         
         /********************* Initialization *********************************/
		 
         $scope.initNavigation = function()
         {
             Navigation.setPage("queryMachine");
             Navigation.navBarClear();
             
         }
         
         $scope.init = function()
         {
             Auth.checkLogin();
             Auth.Authorize("queryMachine");
             $scope.initNavigation();
             $scope.data.init();
              
              
           
         }
         
         $scope.init();
		 
		 
	}
	

})();

