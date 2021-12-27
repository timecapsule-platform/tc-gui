(function(){

	"use strict";

	// Create the Controller
	angular.module("TIMECAPSULE").controller('dashboardController', dashboardController);

	// Inject services to the Controller
	dashboardController.$inject = ["$scope","Auth","$state","Global","Navigation","Util","QueryFactory"];
	
	
	
	// Controller Logic
	function dashboardController($scope,Auth,$state,Global,Navigation,Util,QueryFactory)
	{ 
         $scope.url = 'app/pages/dashboard/';
          
         $scope.user = Auth.user;
        
         // All loading elements
         $scope.isLoading =
         {
            plants : false,
             drugs : false,
             sources : false,
             references : false
         };
        
         $scope.count = 
         {
             plants : 0,
             drugs : 0,
             sources : 0,
             references : 0,
             plantReferences : 0,
             drugReferences : 0
         }
         
        
         
        ////////////////////////////////////   PLANTS   //////////////////////////////////// 
        $scope.getPlantsCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += 'WHERE { ';
             sparql += '?concept  a ' + Global.ns + 'Plant. ';           
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.plants = result.results.bindings[0].count.value;
                }
                  
             });
        }
        
        
        
        ////////////////////////////////////  DRUGS   //////////////////////////////////// 
        
        $scope.getDrugsCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += 'WHERE { ';
             sparql += '?concept a ' + Global.ns + 'DrugComponent. ';
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.drugs = result.results.bindings[0].count.value;
                }
                  
             });
        }
        
        
        
        ////////////////////////////////////   SOURCES   //////////////////////////////////// 
        $scope.getSourcesCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/brahms> ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/snippendaal> ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/thesaurus> ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/economicBotany> ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/radar> ';
             sparql += ' FROM <http://timecapsule.science.uu.nl/TimeCapsule.owl/chrono> ';
             sparql += 'WHERE { ';
             sparql += '?concept a ' + Global.ns + 'ReferenceSource. ';
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.sources = result.results.bindings[0].count.value;
                }
                  
             });
        }
        
        
        ////////////////////////////////////   REFERENCES   //////////////////////////////////// 
        $scope.getReferencesCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += 'WHERE { ';
             sparql += '?concept a ' + Global.ns + 'Reference. ';
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.references = result.results.bindings[0].count.value;
                }
                  
             });
        }
        
        $scope.getPlantReferencesCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += 'WHERE { ';
             sparql += '?concept a ' + Global.ns + 'Reference. ';
             sparql += '?concept   ' + Global.ns + 'refersTo ?nv. ';
             sparql += '?item   ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?item  a ' + Global.ns + 'Plant. ';
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.plantReferences = result.results.bindings[0].count.value;
                }
                  
             });
        }
        
        $scope.getDrugReferencesCount = function()
        {  
             var sparql = "";
              
             sparql += 'SELECT COUNT(DISTINCT ?concept) AS ?count  ';
             sparql += 'WHERE { ';
             sparql += '?concept a ' + Global.ns + 'Reference. ';
             sparql += '?concept   ' + Global.ns + 'refersTo ?nv. ';
             sparql += '?item   ' + Global.ns + 'hasNameVariant ?nv. ';
             sparql += '?item  a ' + Global.ns + 'DrugComponent. ';
             sparql += ' } '; 
                
            QueryFactory.ExecuteQuery(sparql).then(function(result)
             {   
                if(!result.error)
                {   
                    $scope.count.drugReferences = result.results.bindings[0].count.value;
                }
                  
             });
        }
          
        
        
        
        
         
         $scope.initNavigation = function()
         {
             Navigation.setPage('dashboard');
             Navigation.navBarClear();
             
         }
         
          
          
         $scope.init = function()
		 {  
            Auth.checkLogin();
            Auth.Authorize("dashboard");
            $scope.initNavigation();
             
            $scope.getPlantsCount();
            $scope.getDrugsCount();
            $scope.getSourcesCount();
           // $scope.getReferencesCount();
           // $scope.getPlantReferencesCount();
           // $scope.getDrugReferencesCount();
             
		 }
         
		 
		 $scope.init();
		 
	}
	

})();

