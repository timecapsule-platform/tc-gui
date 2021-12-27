(function () {
   
    'use strict';

    angular.module('TIMECAPSULE').factory('Data', Data);

     Data.$inject = ['$http','Global','ErrorHandler','PlantsFactory','DrugsFactory','DataFactory'];

     function Data($http, Global, ErrorHandler, PlantsFactory, DrugsFactory, DataFactory)
    {

        var factory = {};
        
        factory.timecapsules = [];
        
        factory.search = "";
        
        factory.plants = [];
        factory.drugs = [];
        factory.sources = [];
        factory.locations = [];
        factory.plantParts = [];
        factory.plantFamilies = [];
        factory.publicationLocations = [];
        
        factory.languages =
         [
             {
                 name: "Latin",
                 flag: "latin-flag.svg"
             },
             {
                 name: "Dutch",
                 flag: "dutch-flag.svg"
             },
             {
                 name: "English",
                 flag: "english-flag.svg"
             }
         ];
        
         
        
         
        
        
        
        
        
        factory.datePeriod = 
        {
            min: 1600,
            max: 1700,
            options: 
            {
                floor: 1400,
                ceil: 2020
            }
        }
        
        
        factory.cargo = [];
        
        
        factory.SnipendalImages = [];
        
        factory.LoadSnipendalImages = LoadSnipendalImages;
        factory.GetPlants = GetPlants;
        factory.GetDrugs = GetDrugs;
        
        factory.Get = Get;
        
        factory.init = init;
         
        
        return factory;
        
        
        
        function init()
        { 
            LoadSnipendalImages();
            GetPlants("");
            GetDrugs("");
            GetSources("");    
            GetLocations("");
            GetPlantParts("");
            GetFamilies("");
            GetPublicationLocations("");
        }
        
        
        
        function LoadSnipendalImages()
		 {  
			 PlantsFactory.GetSnipendalImages().then(function(result)
			 {   
                if(!result.error)
                {   
			        factory.SnipendalImages = result;
                     
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
		  }
        
        
        
        function Get(resource,searchTerm)
        {
            if(resource == "Plant Species")
            {
                return GetPlants(searchTerm);
            }
            else
            if(resource == "Drug Component")
            {  
                return GetDrugs(searchTerm);
            }
            else
            if(resource == "Reference Source")
            {  
                return GetSources(searchTerm);
            }
            else
            if(resource == "Location")
            {  
                return GetLocations(searchTerm);
            }
            else
            if(resource == "Plant Part")
            {  
                return GetPlantParts(searchTerm);
            }
            else
            if(resource == "Plant Family")
            {  
                return GetFamilies(searchTerm);
            }
            else
            if(resource == "Publication Location")
            {  
                return GetPublicationLocations(searchTerm);
            }
        }
        
        function GetPlants(searchTerm)
        {  
			 return PlantsFactory.GetAll(searchTerm).then(function(result)
			 {      
                if(!result.error)
                {   
			        factory.plants = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        function GetDrugs(searchTerm)
        {  
			 return DrugsFactory.GetAll(searchTerm).then(function(result)
			 {     
                if(!result.error)
                {   
			        factory.drugs = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        
        function GetSources(searchTerm)
        {  
			 return DataFactory.GetSources(searchTerm).then(function(result)
			 {      
                if(!result.error)
                {   
			        factory.sources = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        
        function GetLocations(searchTerm)
        {  
			 return DataFactory.GetLocations(searchTerm).then(function(result)
			 {    
                if(!result.error)
                {   
			        factory.locations = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        
        function GetPlantParts(searchTerm)
        {  
			 return DataFactory.GetPlantParts(searchTerm).then(function(result)
			 {    
                if(!result.error)
                {   
			        factory.plantParts = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        
        function GetFamilies(searchTerm)
        {  
			 return DataFactory.GetFamilies(searchTerm).then(function(result)
			 {     
                if(!result.error)
                {   
			        factory.plantFamilies = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
        
        function GetPublicationLocations(searchTerm)
        {  
			 return DataFactory.GetPublicationLocations(searchTerm).then(function(result)
			 {     
                if(!result.error)
                {   
			        factory.publicationLocations = result;
                }
                else
                {  
                    ErrorHandler.handleErrorCode(result.code);
                }
                  
			 });
        }
        
          

    }
 
})();