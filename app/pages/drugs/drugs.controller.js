(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('drugsController', drugsController);

	// Inject services to the Controller
	drugsController.$inject = ["$scope","$state","Global","Auth","Navigation","Util","PopupService","MessageService", "ErrorHandler", "DBpediaFactory","DrugsFactory","QueryFactory","Resource","NgMap"];
	
	
	
	// Controller Logic
	function drugsController($scope,$state,Global,Auth,Navigation,Util,PopupService,MessageService, ErrorHandler, DBpediaFactory, DrugsFactory, QueryFactory, Resource, NgMap)
	{ 
         // Urls for the View
         $scope.url = 'app/pages/drugs/';
         $scope.popupUrl = 'app/pages/drugs/popup/';
         $scope.resourceUrl = 'app/shared/resource/';
         
         // Get the utility functions to this scope
         $scope.util = Util;
        
         // The popup service
         $scope.popup = PopupService;
        
         // The service to handle all messages
         $scope.message = MessageService;
        
         // Init the resource
         $scope.resource = Resource;
          
        
         // All loading elements
         $scope.isLoading =
         {
             page: false,
             create: false,
             edit: false,
             delete: false,
             dbpedia: false,
             variants: false,
             pPlants: false,
             sources: false,
             references: false,
             uses: false
         };
         
         // Use this object as a model for CRUD data
         $scope.item = {};
         
        
         $scope.sortOrder = "name";
          
         $scope.filters = 
         {
            role: "all",
            search: ""
         };
        
         $scope.items = [];
          
        
         $scope.item = angular.copy($scope.items[0]);
        
         $scope.fromGraphs = "";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/brahms> ";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/snippendaal> ";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/thesaurus> ";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/economicBotany> ";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/radar> ";
         $scope.fromGraphs += " FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/chrono> ";
        
        
         NgMap.getMap().then(function(map) {});
        
        
         $scope.$on("$destroy", function(){
            $scope.clearMarkers();
            $scope.clearSourceMarkers();
        });
        
        
        
         /*********************  Watchers  *********************************/
        
        $scope.$watch(function () { return $scope.filters.search },function()
        {
            $scope.getDrugs();
        });
        
        
        
         /*********************  Busines Logic  *********************************/
        
        $scope.isSelected = function(item)
        {   
            return ($scope.item && (item.name == $scope.item.name));
        }
        
        
        $scope.selectItem = function(item)
        {
            $scope.item = angular.copy(item,$scope.item);
            $scope.getDrugInfo($scope.item.name,$scope.item.drugName);
             
        }
        
         $scope.showResource = function(type,name,concept)
        {
             $scope.message.clear(); 
             $scope.resource.Get(type,name,concept);

             $scope.popup.resource = Util.showPopup($scope.resourceUrl+'resource.html',$scope);
         }
        
         
        
        /*********************  Popups  *********************************/
        
        
		  
        
         
         /********************* CRUD actions *********************************/
         
         
        $scope.getDrugInfo = function(name,drugName)
        {
             // Get  References
             $scope.getDrugReferences(drugName);
            
             // Count drug references
             $scope.getReferencesCount(drugName);
             
             // Load the name variants
             $scope.getDrugNameVariants(drugName);
             
             // Load all plants the are produced by the drug
             $scope.getDrugPlants(drugName);
             
             // Load all reference sources that mention the drug  
             $scope.getDrugSources(drugName);
             
             // Load all drug uses
             $scope.getDrugUses(drugName);
             
             // Load all drug locations
             //$scope.getDrugLocations(drugName);
            
             // Load all drug Source locations
             $scope.getReferenceSourceLocations(drugName); 
            
        } 
         
        
         
        
        ///////////////////////////////////////////////////////////////////////////////////////////////
         /////////////////////////////////   MAP /////////////////////////////////////////////
         //////////////////////////////////////////////////////////////////////////////////////////////
         
         $scope.clearMarkers = function()
         {
             if($scope.markers && $scope.markers.length)
            {
              for(var i=0;i<$scope.markers.length;i++)
              {
                  $scope.markers[i].setMap(null);
              }
            }
             
            $scope.markers = [];
             
         }
         
         $scope.clearSourceMarkers = function()
         {
            if($scope.sourceMarkers && $scope.sourceMarkers.length)
            {
              for(var i=0;i<$scope.sourceMarkers.length;i++)
              {
                  $scope.sourceMarkers[i].setMap(null);
              }
            }
             
            $scope.sourceMarkers = []; 
                
         }
         
         
         // Adds an info window to map
         $scope.addInfoWindow = function(marker, message) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                if($scope.currentInfoWindow)
                {
                    $scope.currentInfoWindow.close();
                }
                infoWindow.open($scope.map, marker);
                $scope.currentInfoWindow = infoWindow;
            });
        }
         
         
         
           
          
          $scope.getReferenceSourceLocations = function(name)
        { 
            // Clear old markers
            $scope.clearSourceMarkers();
  
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?point ?latitude ?longitude  ?locationName ';
             sparql += $scope.fromGraphs;
             sparql += 'WHERE { '
             sparql += '?p a ' + Global.ns + 'DrugComponent. ';
             sparql += '?p  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?p ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             sparql += '?source ' + Global.ns + 'hasReference ?reference. ';
             sparql += ' { ';
                 sparql += '?source ' + Global.ns + 'hasLocation ?point. ';
                 sparql += ' OPTIONAL { '
                 sparql += ' ?source ' + Global.ns + 'hasLocation ?location. ';
                 sparql += ' ?location ' + Global.ns + 'name ?locationName. ';
                 sparql += ' }.';
             sparql += ' } '; 
             sparql += ' UNION ';  
             sparql += ' { ';
                 sparql += '?source ' + Global.ns + 'refersLocation ?point. ';
                 sparql += ' OPTIONAL { '
                 sparql += ' ?source ' + Global.ns + 'refersLocation ?location. ';
                 sparql += ' ?location ' + Global.ns + 'name ?locationName. ';
                 sparql += ' }.';
             sparql += ' } '; 
             sparql += '?point ' + Global.ns + 'latitude ?latitude. ';
             sparql += '?point ' + Global.ns + 'longitude ?longitude. ';
             sparql += ' } OFFSET 0 LIMIT 1000'; 
                 
             QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                 
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    { 
                        var markerIcon = "assets/images/marker-source.svg";
                        var markerPointer = "Reference Source Location";
                         
                        $scope.sourceMarkers[i] = new google.maps.Marker(
                        { 
                            icon: markerIcon,
                            position: { lat: Number(references[i].latitude.value), lng: Number(references[i].longitude.value)},
                            map: $scope.map
                         });
                         
                        var name = "Unknown";
                        var type = "Unknown";
                        
                        if(references[i].locationName)
                        {
                            name = references[i].locationName.value;
                        }
                        
                        
                        var infoText = "<b>Location name:</b> " + name + " <br/>";
                            infoText = infoText + " <b>Latitude:</b> " + Number(references[i].latitude.value) + " <br/>";
                            infoText = infoText + " <b>Longitude:</b> " + Number(references[i].longitude.value) + " <br/>";
                            infoText = infoText + " <b>Pointer Explaination:</b> " + markerPointer + " <br/>";
                        
                        $scope.addInfoWindow($scope.sourceMarkers[i], infoText);
                        
                         
                    }
                    
                   
                }
                  
             });
              
              
        }   
         
          
          ///////////////////////////////////////////////////////////////////////////////////////////////
         /////////////////////////////////  EXTRAS        /////////////////////////////////////////////
         //////////////////////////////////////////////////////////////////////////////////////////////
     
         $scope.getAllReferences = function(drugName)
        {
             
             $scope.isLoading.referencesAll = true;
             $scope.allLoaded = false;
             
             var sparql = "";
             
             sparql += 'SELECT DISTINCT ?name ?drug ?lineNumber ?barcode ?id  ?plantName ?plantVariant  ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ';
             sparql += $scope.fromGraphs;
             sparql += 'WHERE { ';
             sparql += '?dc a ' + Global.ns + 'DrugComponent. ';
             sparql += '?dc ' + Global.ns + 'name ?drug. ';
             sparql += '?dc' + Global.ns + 'name "'+drugName+'"^^xsd:string. ';
             sparql += '?dc ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
             
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             sparql += 'OPTIONAL { ?nv ' + Global.ns + 'language ?language.  }. '; 
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'lineNumber ?lineNumber.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'barcode ?barcode.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'id ?id.  }. ';
              
             
             sparql += 'OPTIONAL {';
             sparql += ' ?referenceSource ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?referenceSource ' + Global.ns + 'name ?referenceSourceName.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'language ?referenceSourceLanguage. }.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'date ?referenceSourceDate. }.';
             sparql += ' }. ';
            
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
             sparql += ' }. ';
             
             
             sparql += ' } ORDER BY ASC(?name)  OFFSET 50 LIMIT 2000'; 
      
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {     
                $scope.isLoading.referencesAll = false;
                $scope.allLoaded = true;
                console.log(result);
                if(!result.error)
                {    
                      //angular.extend($scope.item.references, result.results.bindings);    
                    for(var i=0;i<result.results.bindings.length;i++)
                    {
                        $scope.item.references.push(result.results.bindings[i]);
                    }
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
        }
         
         
         
         $scope.getReferencesCount = function(drugName)
        {
             $scope.item.referencesCount = 0;
             
             var sparql = "";
             
             sparql += 'SELECT  (COUNT(*) as ?count) WHERE { {';
             sparql += 'SELECT DISTINCT   ?name ?drug ?lineNumber ?barcode ?id  ?plantName ?plantVariant   ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage   ';
             sparql += $scope.fromGraphs;
             sparql += 'WHERE { ';
             sparql += '?dc a ' + Global.ns + 'DrugComponent. ';
             sparql += '?dc ' + Global.ns + 'name ?drug. ';
             sparql += '?dc ' + Global.ns + 'name "'+drugName+'"^^xsd:string. ';
             sparql += '?dc ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             sparql += 'OPTIONAL { ?nv ' + Global.ns + 'language ?language.  }. '; 
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'lineNumber ?lineNumber.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'barcode ?barcode.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'id ?id.  }. ';
              
             
             sparql += 'OPTIONAL {';
             sparql += ' ?referenceSource ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?referenceSource ' + Global.ns + 'name ?referenceSourceName.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'language ?referenceSourceLanguage. }.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'date ?referenceSourceDate. }.';
             sparql += ' }. ';
            
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
             sparql += ' }. ';
             
             
             sparql += ' } '; 
             sparql += ' } } '; 
        
             console.log(sparql);
             
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {     
                if(!result.error)
                {    
                    $scope.item.referencesCount = result.results.bindings[0].count.value;    
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
        }
     
         
         
         ///////////////////////////////////////////////////////////////////////////////////////////////
         /////////////////////////////////   MICRO-GETTERS /////////////////////////////////////////////
         //////////////////////////////////////////////////////////////////////////////////////////////
          
          
         
          /////////////////////  GET DRUG REFERENCES  /////////////////////////////////
          
          $scope.getDrugReferences = function(drugName)
        {
             $scope.item.references = [];
             
             $scope.isLoading.references = true;
             
             var sparql = "";
             
             sparql += 'SELECT DISTINCT ?name ?drug ?lineNumber ?barcode ?id  ?plantName ?plantVariant   ?referenceSourceName ?referenceSourceDate ?referenceSourceLanguage ';
             sparql += $scope.fromGraphs;
             sparql += 'WHERE { ';
             sparql += '?dc a ' + Global.ns + 'DrugComponent. ';
             sparql += '?dc ' + Global.ns + 'name ?drug. ';
             sparql += '?dc ' + Global.ns + 'name "'+drugName+'"^^xsd:string. ';
             sparql += '?dc ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             sparql += 'OPTIONAL { ?nv ' + Global.ns + 'language ?language.  }. '; 
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'lineNumber ?lineNumber.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'barcode ?barcode.  }. ';
             sparql += 'OPTIONAL { ?reference ' + Global.ns + 'id ?id.  }. ';
             
             
             sparql += 'OPTIONAL {';
             sparql += ' ?referenceSource ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?referenceSource ' + Global.ns + 'name ?referenceSourceName.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'language ?referenceSourceLanguage. }.';
                sparql += 'OPTIONAL { ?referenceSource ' + Global.ns + 'date ?referenceSourceDate. }.';
             sparql += ' }. ';
            
             sparql += 'OPTIONAL {';
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
             sparql += ' }. ';
             
             
             sparql += ' } ORDER BY ASC(?name) LIMIT 50 OFFSET 0'; 
            
           
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                $scope.isLoading.references = false;
                
                if(!result.error)
                {    
                    $scope.item.references = result.results.bindings;    
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }

             });
           
            
        }
          
          
          
          /////////////////////  GET DRUG USES /////////////////////////////////

        $scope.getDrugSources = function(name)
        {
            $scope.item.sources = [];
              
            $scope.isLoading.sources = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?sourceName ';
             sparql += $scope.fromGraphs;
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?source ' + Global.ns + 'hasReference ?reference.';
             sparql += ' ?source ' + Global.ns + 'name ?sourceName.';
               
             sparql += ' } ORDER BY ASC(?sourceName) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {    
                $scope.isLoading.sources = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    { 
                        $scope.item.sources.push(references[i].sourceName.value);
                    }
                }
                  
             });
        }
            
          
          
          
          
          
          
        /////////////////////  GET DRUG USES /////////////////////////////////
          
           
           $scope.getDrugUses = function(name)
        {
            $scope.item.uses = [];
              
            $scope.isLoading.uses = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?use ';
             sparql += $scope.fromGraphs;  
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?reference ' + Global.ns + 'refersUse ?u.';
             sparql += ' ?u ' + Global.ns + 'description ?use.';
               
             sparql += ' } ORDER BY ASC(?use) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                $scope.isLoading.uses = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    { 
                        $scope.item.uses.push(references[i].use.value);
                    }
                }
                  
             });
              
        }
          
          
          /////////////////////  GET DRUG PLANTS /////////////////////////////////
          
           
           $scope.getDrugPlants = function(name)
        {
            $scope.item.plants = [];
              
             $scope.isLoading.pPlants = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?plantName  ?plantVariant ';
             sparql += $scope.fromGraphs;   
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?reference ' + Global.ns + 'refersTo ?nv. ';
             
             sparql += ' ?reference ' + Global.ns + 'referredToBeProducedBy ?plantReference.';
             sparql += ' ?plantReference ' + Global.ns + 'refersTo ?plantNameVariant.';
             sparql += ' ?plantNameVariant ' + Global.ns + 'nameVariant ?plantVariant.';
             sparql += ' ?plant ' + Global.ns + 'hasNameVariant ?plantNameVariant.';
             sparql += ' ?plant ' + Global.ns + 'name ?plantName.';
              
             sparql += ' } ORDER BY ASC(?plantName) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                $scope.isLoading.pPlants = false;  
                
                if(!result.error)
                {   
                    var references = result.results.bindings;
                     
                    for(var i=0;i<references.length;i++)
                    {
                        if(references[i].plantVariant)
                        {
                            var plant = 
                            { 
                                name: references[i].plantName.value, 
                                variants : []
                            };

                            var variant = references[i].plantVariant.value;

                            var index = Util.conceptExists($scope.item.plants,plant);

                            if(index == -1)
                            {
                                 plant.variants.push(variant);
                                 $scope.item.plants.push(plant);
                            }
                            else
                            {
                                if(!Util.exists($scope.item.plants[index].variants,variant))
                                {
                                    $scope.item.plants[index].variants.push(variant);
                                }
                            }
                        }
                    }
                  
                }
                  
             });
        }
           
           
           
           
           
           /////////////////////  GET NAME VARIANTS /////////////////////////////////
         
          $scope.getDrugNameVariants = function(name)
        {
            $scope.item.variants = [];
              
            $scope.isLoading.variants = true;  
              
             var sparql = "";
              
             sparql += 'SELECT DISTINCT ?name  ';
             sparql += $scope.fromGraphs;  
             sparql += 'WHERE { ';
             sparql += '?d a ' + Global.ns + 'DrugComponent. ';
             sparql += '?d  ' + Global.ns + 'name "'+name+'"^^xsd:string. ';
             sparql += '?d ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?nv ' + Global.ns + 'nameVariant ?name. ';
              
             sparql += ' } ORDER BY ASC(?name) '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {  
                $scope.isLoading.variants = false;  
                
                if(!result.error)
                {   
                    var variants = result.results.bindings;
                     
                    for(var i=0;i<variants.length;i++)
                    {
                        $scope.item.variants.push(variants[i].name.value);    
                    }
                  
                }
                
             });
        }
         
          
          
         
         /********************* Data Collectors  *********************************/
         
          
       
          
         
         $scope.getDrugs = function()
		 {  
			 DrugsFactory.GetAll($scope.filters.search).then(function(result)
			 {     
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
             Navigation.setPage("drugs");
             Navigation.navBarClear();
             
         }
         
         $scope.init = function()
         {
             Auth.checkLogin();
             Auth.Authorize("drugs");
             $scope.initNavigation();
             $scope.getDrugs();
              
         }
         
         $scope.init();
		 
		 
	}
	

})();

